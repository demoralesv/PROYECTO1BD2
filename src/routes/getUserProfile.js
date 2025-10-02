import { Router } from "express";
import { getFollowCounts } from "./getFollowCounts.js";
import { verifyToken } from "./auth.routes.js";
import User from "../models/User.js";

const router = Router();

router.get("/users/:username", verifyToken, async (req, res) => {
  const { username } = req.params;
  try {
    const doc = await User.findOne(
      { username: username },
      { username: 1, fullname: 1, birthDate: 1, avatarUrl: 1, role: 1 }
    ).lean();
    const { followers, following } = await getFollowCounts(doc.username);
    if (!doc) return res.status(404).json({ error: "User not found" });
    const payload = {
      username: doc.username,
      fullName: doc.fullname || "",
      dob: doc.birthDate || null,
      avatarUrl: doc.avatarUrl || null,
      stats: {
        files: 0,         
        followers,        
        following,        
      },
    };

    return res.json(payload);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
