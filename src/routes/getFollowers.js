import { Router } from "express";
import driver from "../databases/neo4j.js";
import { verifyToken } from "./auth.routes.js";
import User from "../models/User.js";

const router = Router();

function dicebear(seed){
  const s = encodeURIComponent((seed || "User").trim() || "User");
  return `https://api.dicebear.com/8.x/initials/svg?seed=${s}`;
}
async function listFollowers(req, res){
  const mongoId = req.userId;
  const session = driver.session({ defaultAccessMode: "READ" });
  try {
    const meDoc = await User.findById(mongoId, { username: 1, fullname: 1 }).lean();
    if (!meDoc) return res.status(404).json({ error: "User not found" });
    const myUsername = meDoc.username;

    const neo = await session.executeRead(tx => tx.run(`
      MATCH (n:User)-[:Friends]->(me:User {ID: $me})
      RETURN n.ID AS username
      ORDER BY toLower(n.ID) ASC
    `, { me: myUsername }));

    const usernames = neo.records.map(r => r.get("username")).filter(Boolean);
    if (usernames.length === 0) return res.json({ items: [] });

    const docs = await User.find(
      { username: { $in: usernames } },
      { username:1, fullname:1, avatarUrl:1 }
    ).lean();

    const byU = new Map(docs.map(d => [d.username, d]));
    const items = usernames.map(u => {
      const d = byU.get(u);
      const fullName = (d && (d.fullname || d.fullName)) || "";
      return {
        id: u,
        username: u,
        fullName: fullName || "—",
        avatarUrl: (d && d.avatarUrl) || dicebear(fullName || u),
      };
    });

    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await session.close();
  }
}

async function removeFollower(req, res){
  const mongoId = req.userId;
  const followerUsername = req.params.username;
  const session = driver.session({ defaultAccessMode: "WRITE" });
  try {
    const meDoc = await User.findById(mongoId, { username: 1 }).lean();
    if (!meDoc) return res.status(404).json({ error: "User not found" });

    const result = await session.executeWrite(tx => tx.run(`
      MATCH (f:User {ID: $follower})-[r:Friends]->(me:User {ID: $me})
      DELETE r
      RETURN count(r) AS removed
    `, { follower: followerUsername, me: meDoc.username }));

    const removed = result.records[0]?.get("removed") || 0;
    if (removed > 0) return res.status(204).end();
    return res.status(404).json({ error: "Follower relation not found" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await session.close();
  }
}


router.get("/followers", verifyToken, listFollowers);
router.get("/me/followers", verifyToken, listFollowers);

router.delete("/followers/:username", verifyToken, removeFollower);
router.delete("/me/followers/:username", verifyToken, removeFollower);

export default router;
