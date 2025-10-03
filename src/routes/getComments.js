// src/routes/getComments.js
import redisClient from "../databases/redis.js";

export async function getComments(req, res) {
  try {
    const { postId } = req.params;
    if (!postId) return res.status(400).json({ error: "Missing postId" });

    // Obtener todos los comentarios del post
    const rawComments = await redisClient.lRange(
      `comentarios:post:${postId}`,
      0,
      -1
    );

    // Parsear los JSON guardados
    const comentarios = [];
    for (const item of rawComments) {
      try {
        comentarios.push(JSON.parse(item));
      } catch {}
    }

    return res.json({ postId, comentarios });
  } catch (err) {
    console.error("❌ Error trying to get comments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default getComments;
