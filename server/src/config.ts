import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4001),
  DATABASE_URL: z.string().min(1),
  DB_SSL: z.enum(["true", "false"]).default("true"),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  BCRYPT_COST: z.coerce.number().int().min(10).max(15).default(12),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  INTERNAL_API_SECRET: z.string().min(16).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

const env = parsed.data;
const corsOrigins = env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  dbSsl: env.DB_SSL === "true",
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTtl: env.ACCESS_TOKEN_TTL,
    refreshTtl: env.REFRESH_TOKEN_TTL,
    issuer: "baikalsphere-auth",
    audience: "baikalsphere",
  },
  bcryptCost: env.BCRYPT_COST,
  corsOrigins,
  internalApiSecret: env.INTERNAL_API_SECRET,
} as const;
