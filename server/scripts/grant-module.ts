import { query } from "../src/db.js";

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: tsx scripts/grant-module.ts <userId> <moduleId>");
  process.exit(1);
}
const moduleId = process.argv[3] || "ar";

await query(
  `INSERT INTO user_modules (user_id, module_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
  [userId, moduleId]
);
console.log(`Granted module '${moduleId}' to user ${userId}`);
process.exit(0);
