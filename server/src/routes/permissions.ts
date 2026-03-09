import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// ── GET /api/permissions/resolve?module=ar ───────────────────────────
// Public endpoint for module backends to resolve a user's permissions.
// Called by AR backend (or any module) with the user's access token to
// get the full list of namespaced permissions for authorization checks.

router.get("/resolve", async (req, res) => {
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
      userId: req.user!.sub,
      module: moduleId,
      permissions: result!.rows.map((r: { code: string }) => r.code),
    });
  } catch (err) {
    console.error("Resolve permissions error:", err);
    res.status(500).json({ error: "Failed to resolve permissions" });
  }
});

export default router;
