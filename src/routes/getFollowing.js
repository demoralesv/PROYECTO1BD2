import { Router } from "express";
import driver from "../databases/neo4j.js";
import { verifyToken } from "./auth.routes.js";
import User from "../models/User.js";

const router = Router();

function dicebear(seed){
  const s = encodeURIComponent((seed || "User").trim() || "User");
  return `https://api.dicebear.com/8.x/initials/svg?seed=${s}`;
}
async function listFollowing(req, res){
  const mongoId = req.userId;
  const session = driver.session({ defaultAccessMode: "READ" });
  try {
    const meDoc = await User.findById(mongoId, { username: 1, fullname: 1 }).lean();
    if (!meDoc) return res.status(404).json({ error: "User not found" });
    const myUsername = meDoc.username;

    const neo = await session.executeRead(tx => tx.run(`
      MATCH (me:User {ID: $me})-[:Friends]->(n:User )
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

async function removeFollowing(req, res){
  const mongoId = req.userId;
  const followerUsername = req.params.username;
  const session = driver.session({ defaultAccessMode: "WRITE" });
  try {
    const meDoc = await User.findById(mongoId, { username: 1 }).lean();
    if (!meDoc) return res.status(404).json({ error: "User not found" });

    const result = await session.executeWrite(tx => tx.run(`
      MATCH (me:User {ID: $me})-[r:Friends]->(f:User {ID: $follower})
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


router.get("/following", verifyToken, listFollowing);
router.get("/me/following", verifyToken, listFollowing);

router.delete("/following/:username", verifyToken, removeFollowing);
router.delete("/me/following/:username", verifyToken, removeFollowing);

export default router;
