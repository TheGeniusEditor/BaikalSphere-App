import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");

async function applySchema() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL !== "false" ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    console.log("Connected to database");

    const sql = fs.readFileSync(schemaPath, "utf-8");
    await client.query(sql);

    console.log("Schema applied successfully");
  } catch (err) {
    console.error("Failed to apply schema:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySchema();
