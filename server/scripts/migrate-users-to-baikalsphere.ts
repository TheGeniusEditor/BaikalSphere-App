/**
 * migrate-users-to-baikalsphere.ts
 *
 * Reads AR hotel users, organizations (corporate logins), and portal sub-users,
 * then inserts them into the Baikalsphere centralized auth DB so they can login
 * via Baikalsphere SSO and still access the AR module.
 *
 * Hotel users keep their same UUID so all AR foreign keys remain valid.
 * Organization corporate users get new UUIDs; the mapping is stored in
 * AR's organizations.baikalsphere_user_id column.
 *
 * Usage:
 *   npx tsx scripts/migrate-users-to-baikalsphere.ts
 */

import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load AR env for AR DB_URL
dotenv.config({ path: path.resolve(__dirname, "../../../ar/server/.env") });
const AR_DB_URL = process.env.DATABASE_URL!;

// Load Baikalsphere env for Baikalsphere DB_URL
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });
const BS_DB_URL = process.env.DATABASE_URL!;

if (!AR_DB_URL || !BS_DB_URL) {
  console.error("Missing DATABASE_URL in one of the .env files");
  process.exit(1);
}

console.log("AR DB:", AR_DB_URL.replace(/:[^@]+@/, ":***@"));
console.log("BS DB:", BS_DB_URL.replace(/:[^@]+@/, ":***@"));

if (AR_DB_URL === BS_DB_URL) {
  console.error("AR and Baikalsphere DB URLs are the same — something is wrong");
  process.exit(1);
}

const arPool = new pg.Pool({ connectionString: AR_DB_URL, ssl: { rejectUnauthorized: false } });
const bsPool = new pg.Pool({ connectionString: BS_DB_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const arClient = await arPool.connect();
  const bsClient = await bsPool.connect();

  try {
    // ── 1. Ensure AR organizations table has baikalsphere_user_id column ──
    console.log("\n── Adding baikalsphere_user_id column to AR organizations ──");
    await arClient.query(`
      ALTER TABLE organizations
        ADD COLUMN IF NOT EXISTS baikalsphere_user_id uuid
    `);
    await arClient.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS organizations_baikalsphere_user_id_uniq
        ON organizations(baikalsphere_user_id) WHERE baikalsphere_user_id IS NOT NULL
    `);
    console.log("  Done.");

    // ── 2. Get the 'ar' module roles from Baikalsphere ──
    const hotelAdminRoleResult = await bsClient.query(
      `SELECT id FROM roles WHERE module_id = 'ar' AND name = 'hotel_admin'`
    );
    if (hotelAdminRoleResult.rowCount === 0) {
      console.error("hotel_admin role not found in Baikalsphere DB. Run schema first.");
      process.exit(1);
    }
    const hotelAdminRoleId = hotelAdminRoleResult.rows[0].id;
    console.log(`  hotel_admin role: ${hotelAdminRoleId}`);

    // ── 3. Migrate AR hotel users ──
    console.log("\n── Migrating hotel users ──");
    const arUsers = await arClient.query(
      `SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.is_active
       FROM users u ORDER BY u.created_at`
    );

    let hotelMigrated = 0;
    let hotelSkipped = 0;

    for (const u of arUsers.rows) {
      // Check if email already exists in Baikalsphere
      const existing = await bsClient.query(
        `SELECT id FROM users WHERE email = $1`,
        [u.email]
      );

      if (existing.rowCount! > 0) {
        console.log(`  SKIP (exists): ${u.email} → bs_id: ${existing.rows[0].id}`);
        // Still ensure module access
        await bsClient.query(
          `INSERT INTO user_modules (user_id, module_id) VALUES ($1, 'ar') ON CONFLICT DO NOTHING`,
          [existing.rows[0].id]
        );
        hotelSkipped++;
        continue;
      }

      // Insert with SAME UUID so all AR FKs remain valid
      await bsClient.query(
        `INSERT INTO users (id, email, password_hash, full_name, platform_role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.email, u.password_hash, u.full_name || u.email.split("@")[0], "member", u.is_active]
      );

      // Grant AR module access
      await bsClient.query(
        `INSERT INTO user_modules (user_id, module_id) VALUES ($1, 'ar') ON CONFLICT DO NOTHING`,
        [u.id]
      );

      // Assign hotel_admin role
      await bsClient.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [u.id, hotelAdminRoleId]
      );

      console.log(`  MIGRATED: ${u.email} (id: ${u.id})`);
      hotelMigrated++;
    }

    console.log(`  Hotel users: ${hotelMigrated} migrated, ${hotelSkipped} skipped (already exist)`);

    // ── 4. Migrate corporate/organization users ──
    console.log("\n── Migrating organization corporate users ──");
    const arOrgs = await arClient.query(
      `SELECT id, name, corporate_user_id, corporate_password_hash, contact_email,
              is_active, baikalsphere_user_id
       FROM organizations ORDER BY created_at`
    );

    let orgMigrated = 0;
    let orgSkipped = 0;

    for (const org of arOrgs.rows) {
      // If already has a baikalsphere_user_id, skip
      if (org.baikalsphere_user_id) {
        console.log(`  SKIP (already mapped): ${org.name} → bs_user: ${org.baikalsphere_user_id}`);
        // Ensure module access
        await bsClient.query(
          `INSERT INTO user_modules (user_id, module_id) VALUES ($1, 'ar') ON CONFLICT DO NOTHING`,
          [org.baikalsphere_user_id]
        );
        orgSkipped++;
        continue;
      }

      const orgEmail = org.corporate_user_id; // This is an email-like ID

      // Check if email already exists in Baikalsphere
      const existing = await bsClient.query(
        `SELECT id FROM users WHERE email = $1`,
        [orgEmail]
      );

      let bsUserId: string;

      if (existing.rowCount! > 0) {
        bsUserId = existing.rows[0].id;
        console.log(`  REUSE (email exists): ${org.name} → ${orgEmail} → bs_id: ${bsUserId}`);
      } else {
        // Create new Baikalsphere user for this org
        const result = await bsClient.query(
          `INSERT INTO users (email, password_hash, full_name, platform_role, is_active, email_verified)
           VALUES ($1, $2, $3, 'member', $4, true)
           RETURNING id`,
          [orgEmail, org.corporate_password_hash, org.name, org.is_active]
        );
        bsUserId = result.rows[0].id;
        console.log(`  CREATED: ${org.name} → ${orgEmail} → bs_id: ${bsUserId}`);
      }

      // Grant AR module access
      await bsClient.query(
        `INSERT INTO user_modules (user_id, module_id) VALUES ($1, 'ar') ON CONFLICT DO NOTHING`,
        [bsUserId]
      );

      // Store mapping in AR organizations table
      await arClient.query(
        `UPDATE organizations SET baikalsphere_user_id = $1 WHERE id = $2`,
        [bsUserId, org.id]
      );

      orgMigrated++;
    }

    console.log(`  Org users: ${orgMigrated} migrated, ${orgSkipped} skipped (already mapped)`);

    // ── 5. Migrate corporate portal sub-users ──
    console.log("\n── Migrating corporate portal sub-users ──");
    const portalUsers = await arClient.query(
      `SELECT pu.id, pu.portal_type, pu.parent_id, pu.full_name, pu.email,
              pu.password_hash, pu.role, pu.is_active,
              o.name as org_name, o.baikalsphere_user_id as parent_bs_id
       FROM portal_users pu
       LEFT JOIN organizations o ON o.id = pu.parent_id
       WHERE pu.portal_type = 'corporate'
       ORDER BY pu.created_at`
    );

    let portalMigrated = 0;
    let portalSkipped = 0;

    for (const pu of portalUsers.rows) {
      const existing = await bsClient.query(
        `SELECT id FROM users WHERE email = $1`,
        [pu.email]
      );

      if (existing.rowCount! > 0) {
        console.log(`  SKIP (exists): ${pu.full_name} (${pu.email})`);
        await bsClient.query(
          `INSERT INTO user_modules (user_id, module_id) VALUES ($1, 'ar') ON CONFLICT DO NOTHING`,
          [existing.rows[0].id]
        );
        portalSkipped++;
        continue;
      }

      // Create Baikalsphere user with SAME UUID so portal_users FK references still work
      await bsClient.query(
        `INSERT INTO users (id, email, password_hash, full_name, platform_role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, 'member', $5, true)
         ON CONFLICT (id) DO NOTHING`,
        [pu.id, pu.email, pu.password_hash, pu.full_name, pu.is_active]
      );

      await bsClient.query(
        `INSERT INTO user_modules (user_id, module_id) VALUES ($1, 'ar') ON CONFLICT DO NOTHING`,
        [pu.id]
      );

      console.log(`  MIGRATED: ${pu.full_name} (${pu.email}) - sub-user of ${pu.org_name || pu.parent_id}`);
      portalMigrated++;
    }

    console.log(`  Portal users: ${portalMigrated} migrated, ${portalSkipped} skipped`);

    // ── 6. Migrate hotel-finance portal sub-users ──
    console.log("\n── Migrating hotel-finance portal sub-users ──");
    const hotelPortalUsers = await arClient.query(
      `SELECT pu.id, pu.parent_id, pu.full_name, pu.email,
              pu.password_hash, pu.role, pu.is_active,
              u.email as parent_email
       FROM portal_users pu
       LEFT JOIN users u ON u.id::text = pu.parent_id
       WHERE pu.portal_type = 'hotel_finance'
       ORDER BY pu.created_at`
    );

    let hotelPortalMigrated = 0;
    let hotelPortalSkipped = 0;

    for (const pu of hotelPortalUsers.rows) {
      const existing = await bsClient.query(
        `SELECT id FROM users WHERE email = $1`,
        [pu.email]
      );

      if (existing.rowCount! > 0) {
        console.log(`  SKIP (exists): ${pu.full_name} (${pu.email})`);
        await bsClient.query(
          `INSERT INTO user_modules (user_id, module_id) VALUES ($1, 'ar') ON CONFLICT DO NOTHING`,
          [existing.rows[0].id]
        );
        hotelPortalSkipped++;
        continue;
      }

      await bsClient.query(
        `INSERT INTO users (id, email, password_hash, full_name, platform_role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, 'member', $5, true)
         ON CONFLICT (id) DO NOTHING`,
        [pu.id, pu.email, pu.password_hash, pu.full_name, pu.is_active]
      );

      await bsClient.query(
        `INSERT INTO user_modules (user_id, module_id) VALUES ($1, 'ar') ON CONFLICT DO NOTHING`,
        [pu.id]
      );

      console.log(`  MIGRATED: ${pu.full_name} (${pu.email}) - sub-user of ${pu.parent_email || pu.parent_id}`);
      hotelPortalMigrated++;
    }

    console.log(`  Hotel portal users: ${hotelPortalMigrated} migrated, ${hotelPortalSkipped} skipped`);

    // ── Summary ──
    console.log("\n══════════════════════════════════════");
    console.log("Migration Summary:");
    console.log(`  Hotel users:          ${hotelMigrated} new, ${hotelSkipped} existing`);
    console.log(`  Organization users:   ${orgMigrated} new, ${orgSkipped} existing`);
    console.log(`  Corporate sub-users:  ${portalMigrated} new, ${portalSkipped} existing`);
    console.log(`  Hotel sub-users:      ${hotelPortalMigrated} new, ${hotelPortalSkipped} existing`);
    console.log("══════════════════════════════════════\n");

  } finally {
    arClient.release();
    bsClient.release();
    await arPool.end();
    await bsPool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
