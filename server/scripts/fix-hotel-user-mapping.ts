/**
 * fix-hotel-user-mapping.ts
 *
 * For AR hotel users whose email exists in Baikalsphere but with a different UUID,
 * stores the Baikalsphere UUID in AR's users.baikalsphere_user_id column so the
 * middleware can map SSO tokens to the correct AR user.
 */

import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../../ar/server/.env") });
const AR_DB_URL = process.env.DATABASE_URL!;

dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });
const BS_DB_URL = process.env.DATABASE_URL!;

const arPool = new pg.Pool({ connectionString: AR_DB_URL, ssl: { rejectUnauthorized: false } });
const bsPool = new pg.Pool({ connectionString: BS_DB_URL, ssl: { rejectUnauthorized: false } });

async function main() {
  const arClient = await arPool.connect();
  const bsClient = await bsPool.connect();

  try {
    // Add baikalsphere_user_id column to AR users table
    await arClient.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS baikalsphere_user_id uuid
    `);
    await arClient.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_baikalsphere_user_id_uniq
        ON users(baikalsphere_user_id) WHERE baikalsphere_user_id IS NOT NULL
    `);
    console.log("Added baikalsphere_user_id column to AR users table");

    // Get all AR hotel users
    const arUsers = await arClient.query(
      `SELECT id, email, baikalsphere_user_id FROM users ORDER BY created_at`
    );

    for (const u of arUsers.rows) {
      if (u.baikalsphere_user_id) {
        console.log(`SKIP: ${u.email} already mapped → ${u.baikalsphere_user_id}`);
        continue;
      }

      // Find matching Baikalsphere user by email
      const bsResult = await bsClient.query(
        `SELECT id FROM users WHERE email = $1`,
        [u.email]
      );

      if (bsResult.rowCount === 0) {
        console.log(`SKIP: ${u.email} — not found in Baikalsphere`);
        continue;
      }

      const bsId = bsResult.rows[0].id;

      if (bsId === u.id) {
        // Same UUID — no mapping needed, but store it for consistency
        await arClient.query(
          `UPDATE users SET baikalsphere_user_id = $1 WHERE id = $2`,
          [bsId, u.id]
        );
        console.log(`SAME UUID: ${u.email} (${u.id})`);
      } else {
        // Different UUID — store the Baikalsphere ID for mapping
        await arClient.query(
          `UPDATE users SET baikalsphere_user_id = $1 WHERE id = $2`,
          [bsId, u.id]
        );
        console.log(`MAPPED: ${u.email} → AR: ${u.id} ↔ BS: ${bsId}`);
      }
    }

    console.log("\nDone.");
  } finally {
    arClient.release();
    bsClient.release();
    await arPool.end();
    await bsPool.end();
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
