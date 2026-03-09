import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { query } from "../db.js";
import { config } from "../config.js";

const router = Router();

// Internal API secret middleware
const requireInternalSecret = (
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
) => {
  const secret = req.headers["x-internal-secret"];
  if (!config.internalApiSecret || secret !== config.internalApiSecret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

router.use(requireInternalSecret);

// ── POST /api/internal/provision-user ───
// Creates a Baikalsphere user + grants module access.
// Called by module backends (e.g. AR) when creating sub-users.

const provisionSchema = z.object({
  email: z.string().email().max(320),
  fullName: z.string().min(1).max(200),
  passwordHash: z.string().min(1),
  moduleIds: z.array(z.string()).default([]),
});

router.post("/provision-user", async (req, res) => {
  try {
    const body = provisionSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Validation failed", details: body.error.flatten().fieldErrors });
      return;
    }

    const { email, fullName, passwordHash, moduleIds } = body.data;

    // Check if user already exists
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    let userId: string;

    if (existing!.rows.length > 0) {
      userId = existing!.rows[0].id;
    } else {
      const result = await query(
        `INSERT INTO users (email, password_hash, full_name, platform_role)
         VALUES ($1, $2, $3, 'member')
         RETURNING id`,
        [email, passwordHash, fullName]
      );
      userId = result!.rows[0].id;
    }

    // Grant module access
    for (const moduleId of moduleIds) {
      await query(
        `INSERT INTO user_modules (user_id, module_id) VALUES ($1, $2)
         ON CONFLICT (user_id, module_id) DO NOTHING`,
        [userId, moduleId]
      );
    }

    res.status(201).json({ userId });
  } catch (err) {
    console.error("Provision user error:", err);
    res.status(500).json({ error: "Failed to provision user" });
  }
});

export default router;
