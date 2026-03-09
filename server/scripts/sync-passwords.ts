/**
 * Syncs password hashes from AR hotel users to their Baikalsphere accounts
 * so they can login with their existing AR credentials.
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
    const arUsers = await arClient.query(
      `SELECT email, password_hash FROM users ORDER BY created_at`
    );

    for (const u of arUsers.rows) {
      const result = await bsClient.query(
        `UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id`,
        [u.password_hash, u.email]
      );
      if (result.rowCount! > 0) {
        console.log(`SYNCED: ${u.email} (bs_id: ${result.rows[0].id})`);
      } else {
        console.log(`SKIP: ${u.email} — not in Baikalsphere`);
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
