// src/routes/getComments.js
import { get } from "mongoose";
import redisClient from "../databases/redis.js";

export async function getComments(req, res) {
  try {
    const { postId } = req.params;

    // Obtener todos los comentarios del post
    const rawComments = await redisClient.lRange(`comentarios:post:${postId}`, 0, -1);

    // Parsear los JSON guardados
    const comentarios = rawComments.map((c) => JSON.parse(c));

    return res.json({ postId, comentarios });
  } catch (err) {
    console.error("❌ Error al obtener comentarios:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

export default getComments