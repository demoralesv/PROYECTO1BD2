// Funcion para actualizar perfil
import { Router } from "express";
import User from "../models/User.js";
import { verifyToken } from "./auth.routes.js";
import { getFollowCounts } from "./getFollowCounts.js";

const router = Router();
function dicebearFrom(seed) {
  const s = encodeURIComponent((seed || "User").trim() || "User");
  return `https://api.dicebear.com/8.x/initials/svg?seed=${s}`;
}

// PATCH /me
router.patch("/me", verifyToken, async (req, res) => {
  try {
    const body = req.body || {};
    const current = await User.findById(req.userId);
    if (!current) return res.status(404).json({ error: "User not found" });

    const updates = {};

    if (typeof body.fullName === "string" && body.fullName.trim()) {
      updates.fullname = body.fullName.trim();
    }
    if (body.dob !== undefined) {
      if (!body.dob) {
        updates.birthDate = null;
      } else {
        const d = new Date(body.dob);
        if (isNaN(d.getTime())) {
          return res.status(400).json({ error: "Invalid DOB" });
        }
        if (d > new Date()) {
          return res.status(400).json({ error: "Future DOB not allowed" });
        }
        updates.birthDate = d;
      }
    }
    if (body.avatarUrl !== undefined) {
      if (!body.avatarUrl) {
        const seed = updates.fullname || current.fullname || current.username || "User";
        updates.avatarUrl = dicebearFrom(seed);
      } else if (/^https?:\/\//i.test(body.avatarUrl)) {
        updates.avatarUrl = body.avatarUrl.trim();
      } else {
        return res.status(400).json({ error: "Avatar must be a public URL" });
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true, lean: true }
    );
    const { followers, following } = await getFollowCounts(updated.username);
    res.json({
      username: updated.username,
      fullName: updated.fullname,
      dob: updated.birthDate || null,
      avatarUrl: updated.avatarUrl || null,
      stats: {
        files: 0,         
        followers,        
        following,        
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;