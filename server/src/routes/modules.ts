import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requirePlatformRole } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/modules ─── List all available modules

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, base_url, icon, is_active FROM modules ORDER BY name`
    );
    res.json(result!.rows);
  } catch (err) {
    console.error("List modules error:", err);
    res.status(500).json({ error: "Failed to list modules" });
  }
});

// ── GET /api/modules/:id/roles ─── List roles for a module

router.get("/:id/roles", async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, display_name, description, is_system
       FROM roles WHERE module_id = $1 ORDER BY display_name`,
      [req.params.id]
    );
    res.json(result!.rows);
  } catch (err) {
    console.error("List module roles error:", err);
    res.status(500).json({ error: "Failed to list roles" });
  }
});

// ── GET /api/modules/:id/permissions ─── List permissions for a module

router.get("/:id/permissions", async (req, res) => {
  try {
    const result = await query(
      `SELECT id, code, description FROM permissions WHERE module_id = $1 ORDER BY code`,
      [req.params.id]
    );
    res.json(result!.rows);
  } catch (err) {
    console.error("List module permissions error:", err);
    res.status(500).json({ error: "Failed to list permissions" });
  }
});

// ── POST /api/modules ─── Create a module (superadmin only)

router.post("/", requirePlatformRole("superadmin"), async (req, res) => {
  try {
    const { id, name, description, baseUrl, icon } = req.body;

    if (!id || !name) {
      res.status(400).json({ error: "id and name are required" });
      return;
    }

    await query(
      `INSERT INTO modules (id, name, description, base_url, icon) VALUES ($1, $2, $3, $4, $5)`,
      [id, name, description || null, baseUrl || null, icon || null]
    );

    res.status(201).json({ id, name });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Module already exists" });
      return;
    }
    console.error("Create module error:", err);
    res.status(500).json({ error: "Failed to create module" });
  }
});

export default router;
