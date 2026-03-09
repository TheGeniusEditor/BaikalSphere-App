import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.dbSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  if (config.nodeEnv !== "production") {
    console.error("Postgres pool error:", error.message);
  }
});

const isTransientPgError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("connection terminated unexpectedly") ||
    msg.includes("timeout") ||
    msg.includes("econnreset") ||
    msg.includes("server closed the connection unexpectedly")
  );
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const query = async (text: string, params?: unknown[]) => {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      if (attempt < 2 && isTransientPgError(err)) {
        await wait(500);
        continue;
      }
      throw err;
    }
  }
  throw new Error("query: unreachable");
};
