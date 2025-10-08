import { Router } from "express";
import { verifyToken } from "./auth.routes.js";
import { getBadgeCounts, clearBadge } from "./addNotification.js";

const router = Router();

router.get("/api/badges", verifyToken, async (req, res) => {
  try {
    const counts = await getBadgeCounts(String(req.userId));
    res.json(counts);
  } catch (e) {
    console.error("badges get error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/badges/clear", verifyToken, async (req, res) => {
  try {
    const type = (req.body && req.body.type) || "mensaje";
    await clearBadge(String(req.userId), type);
    res.json({ ok: true });
  } catch (e) {
    console.error("badges clear error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
