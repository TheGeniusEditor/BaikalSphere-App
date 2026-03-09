import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { query } from "../db.js";
import { config } from "../config.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiters.js";

const router = Router();

// ── Validation schemas ───────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  organizationName: z.string().min(1).max(200).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Helpers ──────────────────────────────────────────────────────────

const ACCOUNT_LOCK_THRESHOLD = 5;
const ACCOUNT_LOCK_DURATION_MIN = 15;

function parseTimeToMs(ttl: string): number {
  const match = ttl.match(/^(\d+)(m|h|d)$/);
  if (!match) return 15 * 60 * 1000;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "m") return val * 60 * 1000;
  if (unit === "h") return val * 60 * 60 * 1000;
  return val * 24 * 60 * 60 * 1000;
}

async function getUserModules(userId: string): Promise<string[]> {
  const result = await query(
    `SELECT module_id FROM user_modules WHERE user_id = $1`,
    [userId]
  );
  return result!.rows.map((r: { module_id: string }) => r.module_id);
}

async function issueTokens(user: {
  id: string;
  email: string;
  organization_id: string | null;
  platform_role: string;
}) {
  const modules = await getUserModules(user.id);

  // Slim access token (~200 bytes)
  const accessTokenExpiresInSec = Math.floor(parseTimeToMs(config.jwt.accessTtl) / 1000);
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      orgId: user.organization_id,
      platformRole: user.platform_role,
      modules,
    },
    config.jwt.accessSecret,
    {
      expiresIn: accessTokenExpiresInSec,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }
  );

  // Refresh token — opaque, stored hashed in DB
  const refreshRaw = crypto.randomBytes(32).toString("base64url");
  const refreshHash = crypto.createHash("sha256").update(refreshRaw).digest("hex");
  const expiresAt = new Date(Date.now() + parseTimeToMs(config.jwt.refreshTtl));

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, refreshHash, expiresAt.toISOString()]
  );

  return { accessToken, refreshToken: refreshRaw, expiresAt };
}

// ── POST /api/auth/register ──────────────────────────────────────────

router.post("/register", authLimiter, async (req, res) => {
  try {
    const body = registerSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Validation failed", details: body.error.flatten().fieldErrors });
      return;
    }

    const { email, password, fullName, phone, organizationName } = body.data;

    // Check duplicate email
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing!.rows.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptCost);

    let organizationId: string | null = null;

    // If organization name provided, create it
    if (organizationName) {
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const orgResult = await query(
        `INSERT INTO organizations (name, slug) VALUES ($1, $2)
         RETURNING id`,
        [organizationName, slug + "-" + crypto.randomBytes(3).toString("hex")]
      );
      organizationId = orgResult!.rows[0].id;
    }

    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, organization_id, platform_role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, platform_role, organization_id`,
      [email, passwordHash, fullName, phone || null, organizationId, organizationName ? "org_admin" : "member"]
    );

    const user = result!.rows[0];
    const tokens = await issueTokens(user);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      domain: config.nodeEnv === "production" ? ".baikalsphere.com" : undefined,
      path: "/api/auth",
      maxAge: parseTimeToMs(config.jwt.refreshTtl),
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        platformRole: user.platform_role,
        organizationId: user.organization_id,
      },
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────

router.post("/login", authLimiter, async (req, res) => {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const { email, password } = body.data;

    const result = await query(
      `SELECT id, email, password_hash, full_name, platform_role, organization_id,
              is_active, failed_login_attempts, locked_until
       FROM users WHERE email = $1`,
      [email]
    );

    if (result!.rows.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = result!.rows[0];

    if (!user.is_active) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    // Check account lockout
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      res.status(423).json({ error: "Account temporarily locked. Try again later." });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      const attempts = user.failed_login_attempts + 1;
      const lockUntil =
        attempts >= ACCOUNT_LOCK_THRESHOLD
          ? new Date(Date.now() + ACCOUNT_LOCK_DURATION_MIN * 60 * 1000).toISOString()
          : null;

      await query(
        `UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3`,
        [attempts, lockUntil, user.id]
      );

      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Reset failed attempts and update last login
    await query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = now() WHERE id = $1`,
      [user.id]
    );

    const tokens = await issueTokens(user);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      domain: config.nodeEnv === "production" ? ".baikalsphere.com" : undefined,
      path: "/api/auth",
      maxAge: parseTimeToMs(config.jwt.refreshTtl),
    });

    const modules = await getUserModules(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        platformRole: user.platform_role,
        organizationId: user.organization_id,
        modules,
      },
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── POST /api/auth/refresh ───────────────────────────────────────────

router.post("/refresh", async (req, res) => {
  try {
    const refreshRaw = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshRaw) {
      res.status(401).json({ error: "Refresh token required" });
      return;
    }

    const tokenHash = crypto.createHash("sha256").update(refreshRaw).digest("hex");

    const result = await query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at,
              u.email, u.full_name, u.platform_role, u.organization_id, u.is_active
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1`,
      [tokenHash]
    );

    if (result!.rows.length === 0) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    const row = result!.rows[0];

    if (row.revoked_at || new Date(row.expires_at) < new Date()) {
      res.status(401).json({ error: "Refresh token expired or revoked" });
      return;
    }

    if (!row.is_active) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    // Revoke old token (rotation)
    await query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`,
      [row.id]
    );

    const user = {
      id: row.user_id,
      email: row.email,
      organization_id: row.organization_id,
      platform_role: row.platform_role,
    };

    const tokens = await issueTokens(user);

    // Link old token to new one
    const newTokenHash = crypto.createHash("sha256").update(tokens.refreshToken).digest("hex");
    const newRow = await query(
      `SELECT id FROM refresh_tokens WHERE token_hash = $1`,
      [newTokenHash]
    );
    if (newRow!.rows.length > 0) {
      await query(
        `UPDATE refresh_tokens SET replaced_by = $1 WHERE id = $2`,
        [newRow!.rows[0].id, row.id]
      );
    }

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      domain: config.nodeEnv === "production" ? ".baikalsphere.com" : undefined,
      path: "/api/auth",
      maxAge: parseTimeToMs(config.jwt.refreshTtl),
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: "Token refresh failed" });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────

router.post("/logout", async (req, res) => {
  try {
    const refreshRaw = req.cookies?.refreshToken;
    if (refreshRaw) {
      const tokenHash = crypto.createHash("sha256").update(refreshRaw).digest("hex");
      await query(
        `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`,
        [tokenHash]
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      domain: config.nodeEnv === "production" ? ".baikalsphere.com" : undefined,
      path: "/api/auth",
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed" });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.platform_role,
              u.organization_id, o.name AS organization_name, o.slug AS organization_slug
       FROM users u
       LEFT JOIN organizations o ON o.id = u.organization_id
       WHERE u.id = $1`,
      [req.user!.sub]
    );

    if (result!.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = result!.rows[0];
    const modules = await getUserModules(user.id);

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      platformRole: user.platform_role,
      organizationId: user.organization_id,
      organizationName: user.organization_name,
      organizationSlug: user.organization_slug,
      modules,
    });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ── GET /api/auth/me/permissions?module=ar ───────────────────────────
// Returns granular permissions for the current user in a specific module.
// This is the endpoint that module backends call (or frontend caches) to
// resolve namespaced permissions like "ar:bookings:read".

router.get("/me/permissions", requireAuth, async (req, res) => {
  try {
    const moduleId = req.query.module as string;
    if (!moduleId) {
      res.status(400).json({ error: "module query parameter required" });
      return;
    }

    if (!req.user!.modules.includes(moduleId)) {
      res.status(403).json({ error: `No access to module: ${moduleId}` });
      return;
    }

    const result = await query(
      `SELECT DISTINCT p.code
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       JOIN role_permissions rp ON rp.role_id = r.id
       JOIN permissions p ON p.id = rp.permission_id
       WHERE ur.user_id = $1 AND r.module_id = $2`,
      [req.user!.sub, moduleId]
    );

    res.json({
      module: moduleId,
      permissions: result!.rows.map((r: { code: string }) => r.code),
    });
  } catch (err) {
    console.error("Permissions error:", err);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});

export default router;
