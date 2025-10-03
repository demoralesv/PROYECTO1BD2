import redisClient from "../databases/redis.js";
import { Router } from "express";

const router = Router();

export async function deleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    if (!postId || !commentId) {
      return res.status(400).json({ error: "Missing postId or commentId" });
    }

    const key = `comentarios:post:${postId}`;
    const raw = await redisClient.lRange(key, 0, -1);

    let foundIndex = -1;
    let updated = null;

    for (let i = 0; i < raw.length; i++) {
      let c;
      try {
        c = JSON.parse(raw[i]);
      } catch {
        continue;
      }
      if (c && c.id === commentId) {
        foundIndex = i;
        updated = { ...c, deleted: true };
        await redisClient.lSet(key, i, JSON.stringify(updated));
        break;
      }
    }

    if (foundIndex === -1)
      return res.status(404).json({ error: "Comment not found" });
    return res.json({ ok: true, comment: updated });
  } catch (err) {
    console.error("❌ Error trying to delete comment:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default deleteComment;
