import { Router } from "express";
import driver from "../databases/neo4j.js";
import User from "../models/User.js";
import { verifyToken } from "./auth.routes.js";

const router = Router();


router.get("/following/:username", verifyToken, async (req, res) => {
  const other = req.params.username;
  const session = driver.session({ defaultAccessMode: "READ" });
  try {
    const meDoc = await User.findById(req.userId, { username: 1 }).lean();
    if (!meDoc) return res.status(404).json({ error: "User not found" });
    const me = meDoc.username;

    const result = await session.run(
      `
      MATCH (a:User {ID: $from})-[:Friends]->(b:User {ID: $to})
      RETURN count(*) > 0 AS following
      `,
      { from: me, to: other }
    );

    const following = result.records[0]?.get("following") || false;
    res.json({ following });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await session.close();
  }
});


/* -------- FOLLOW ---------- */
router.post("/following/:username", verifyToken, async (req, res) => {
  try {
    const follower = await User.findById(req.userId);
    const following = await User.findOne({ username: req.params.username });
    if (!following) return res.status(404).json({ error: "User not found" });
    if (follower.username === following.username)
      return res.status(400).json({ error: "You cannot follow yourself" });

    const session = driver.session();
    try {
      await session.run(
        `MATCH (a:User {ID:$from})
         MATCH (b:User {ID:$to})
         MERGE (a)-[:Friends]->(b)`,
        { from: follower.username, to: following.username }
      );
    } finally {
      await session.close();
    }

    res.status(200).json({ msg: `Now following ${following.username}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/* -------- UNFOLLOW ---------- */
router.delete("/following/:username", verifyToken, async (req, res) => {
  try {
    const follower = await User.findById(req.userId);
    const following = await User.findOne({ username: req.params.username });
    if (!following) return res.status(404).json({ error: "User not found" });

    const session = driver.session();
    try {
      await session.run(
        `MATCH (a:User {ID:$from})-[r:Friends]->(b:User {ID:$to})
         DELETE r`,
        { from: follower.username, to: following.username }
      );
    } finally {
      await session.close();
    }

    res.status(200).json({ msg: `Unfollowed ${following.username}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
