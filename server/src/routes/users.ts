import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { query } from "../db.js";
import { config } from "../config.js";
import { requireAuth, requirePlatformRole } from "../middleware/auth.js";

const router = Router();

// All user management routes require authentication
router.use(requireAuth);

// ── GET /api/users ─── List users (org_admin sees their org, superadmin sees all)

router.get("/", async (req, res) => {
  try {
    const { platformRole, orgId } = req.user!;

    let result;
    if (platformRole === "superadmin") {
      result = await query(
        `SELECT u.id, u.email, u.full_name, u.phone, u.platform_role,
                u.organization_id, o.name AS organization_name, u.is_active, u.last_login_at, u.created_at
         FROM users u
         LEFT JOIN organizations o ON o.id = u.organization_id
         ORDER BY u.created_at DESC`
      );
    } else if (platformRole === "org_admin" && orgId) {
      result = await query(
        `SELECT u.id, u.email, u.full_name, u.phone, u.platform_role,
                u.organization_id, o.name AS organization_name, u.is_active, u.last_login_at, u.created_at
         FROM users u
         LEFT JOIN organizations o ON o.id = u.organization_id
         WHERE u.organization_id = $1
         ORDER BY u.created_at DESC`,
        [orgId]
      );
    } else {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    res.json(result!.rows);
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ error: "Failed to list users" });
  }
});

// ── POST /api/users ─── Create user (org_admin or superadmin)

const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  fullName: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  platformRole: z.enum(["member", "org_admin"]).default("member"),
  organizationId: z.string().uuid().optional(),
  moduleIds: z.array(z.string()).optional(),
});

router.post("/", requirePlatformRole("org_admin", "superadmin"), async (req, res) => {
  try {
    const body = createUserSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Validation failed", details: body.error.flatten().fieldErrors });
      return;
    }

    const { email, password, fullName, phone, platformRole, organizationId, moduleIds } = body.data;

    // org_admin can only create members in their own org
    const effectiveOrgId = req.user!.platformRole === "superadmin"
      ? (organizationId || null)
      : req.user!.orgId;

    if (req.user!.platformRole === "org_admin" && platformRole !== "member") {
      res.status(403).json({ error: "Org admins can only create member accounts" });
      return;
    }

    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing!.rows.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptCost);

    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, organization_id, platform_role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, platform_role, organization_id`,
      [email, passwordHash, fullName, phone || null, effectiveOrgId, platformRole]
    );

    const user = result!.rows[0];

    // Grant module access if specified
    if (moduleIds && moduleIds.length > 0) {
      for (const moduleId of moduleIds) {
        await query(
          `INSERT INTO user_modules (user_id, module_id, granted_by) VALUES ($1, $2, $3)
           ON CONFLICT (user_id, module_id) DO NOTHING`,
          [user.id, moduleId, req.user!.sub]
        );
      }
    }

    res.status(201).json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      platformRole: user.platform_role,
      organizationId: user.organization_id,
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// ── PUT /api/users/:id/modules ─── Update module access for a user

const updateModulesSchema = z.object({
  moduleIds: z.array(z.string()),
});

router.put("/:id/modules", requirePlatformRole("org_admin", "superadmin"), async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const body = updateModulesSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Validation failed" });
      return;
    }

    // Verify target user exists and is in same org (for org_admin)
    const userResult = await query(`SELECT id, organization_id FROM users WHERE id = $1`, [targetUserId]);
    if (userResult!.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (req.user!.platformRole === "org_admin" && userResult!.rows[0].organization_id !== req.user!.orgId) {
      res.status(403).json({ error: "Cannot manage users outside your organization" });
      return;
    }

    const { moduleIds } = body.data;

    // Remove all current module access
    await query(`DELETE FROM user_modules WHERE user_id = $1`, [targetUserId]);

    // Grant new module access
    for (const moduleId of moduleIds) {
      await query(
        `INSERT INTO user_modules (user_id, module_id, granted_by) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, module_id) DO NOTHING`,
        [targetUserId, moduleId, req.user!.sub]
      );
    }

    res.json({ ok: true, moduleIds });
  } catch (err) {
    console.error("Update user modules error:", err);
    res.status(500).json({ error: "Failed to update module access" });
  }
});

// ── PUT /api/users/:id/roles ─── Update roles for a user in a module

const updateRolesSchema = z.object({
  roleIds: z.array(z.string().uuid()),
});

router.put("/:id/roles", requirePlatformRole("org_admin", "superadmin"), async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const body = updateRolesSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Validation failed" });
      return;
    }

    // Verify target user exists
    const userResult = await query(`SELECT id, organization_id FROM users WHERE id = $1`, [targetUserId]);
    if (userResult!.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (req.user!.platformRole === "org_admin" && userResult!.rows[0].organization_id !== req.user!.orgId) {
      res.status(403).json({ error: "Cannot manage users outside your organization" });
      return;
    }

    const { roleIds } = body.data;

    // Remove existing roles
    await query(`DELETE FROM user_roles WHERE user_id = $1`, [targetUserId]);

    // Assign new roles
    for (const roleId of roleIds) {
      await query(
        `INSERT INTO user_roles (user_id, role_id, granted_by) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, role_id) DO NOTHING`,
        [targetUserId, roleId, req.user!.sub]
      );
    }

    res.json({ ok: true, roleIds });
  } catch (err) {
    console.error("Update user roles error:", err);
    res.status(500).json({ error: "Failed to update roles" });
  }
});

// ── PATCH /api/users/:id/deactivate ─── Deactivate a user

router.patch("/:id/deactivate", requirePlatformRole("org_admin", "superadmin"), async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user!.sub) {
      res.status(400).json({ error: "Cannot deactivate yourself" });
      return;
    }

    await query(`UPDATE users SET is_active = false, updated_at = now() WHERE id = $1`, [targetUserId]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Deactivate user error:", err);
    res.status(500).json({ error: "Failed to deactivate user" });
  }
});

export default router;
