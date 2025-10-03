import redisClient from "../databases/redis.js";
import { Router } from "express";

const router = Router();

export async function postComment(req, res) {
  try {
    // valores desde el request
    const { texto, idAutor, parentId } = req.body;
    const { postId } = req.params;

    // validaciones simples
    if (!postId) {
      return res.status(400).json({ error: "Missing postId" });
    }
    if (!texto || !idAutor) {
      return res.status(400).json({ error: "Necessary fields are empty" });
    }

    // creacion del comentario
    const comentario = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      texto: texto.trim(),
      idAutor: String(idAutor),
      fecha: Date.now(),
      deleted: false,
      ...(parentId ? { parentId: String(parentId) } : {}),
    };

    // guardar en Redis
    await redisClient.rPush(
      `comentarios:post:${postId}`,
      JSON.stringify(comentario)
    );

    // responder
    return res.status(201).json(comentario);
  } catch (err) {
    console.error("Error trying to save comment:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default postComment;
