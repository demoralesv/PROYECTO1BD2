import { Router } from "express";
import User from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

async function listUsers(req, res) {
  try {
    const users = await User.find({}, "username fullname role createdAt").sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function promoteUser(req, res) {
  try {
    const { id } = req.params;

    
    const user = await User.findByIdAndUpdate(
      id,
      { role: "admin" },
      { new: true, projection: "username fullname role" }
    );
    if (!user) return res.status(404).json({ error: "User not Found" });
    res.json({ msg: "User is now an Admin ✅", user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function demoteUser(req, res) {
  try {
    const { id } = req.params;

    if (req.user.id === id) return res.status(400).json({ error: "You can not remove yourself as Admin" });

    const user = await User.findByIdAndUpdate(
      id,
      { role: "user" },
      { new: true, projection: "username fullname role" }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ msg: "User is no longer an Admin ⚙️", user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


router.get("/users", requireAuth, requireAdmin, listUsers);
router.put("/users/:id/promote", requireAuth, requireAdmin, promoteUser);
router.put("/users/:id/demote", requireAuth, requireAdmin, demoteUser);

export default router;
