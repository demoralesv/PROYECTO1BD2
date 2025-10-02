import redisClient from '../databases/redis.js'
import { Router } from "express";

const router = Router()

export async function postComment(req, res) {
    try {
        // valores desde el request
        const { texto, idAutor } = req.body;
        const { postId } = req.params;

        // validaciones simples
        if (!texto || !idAutor) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        // creacion del comentario
        const comentario = {
            texto,
            idAutor,
            fecha: Date.now()
        };

        // guardar en Redis
        await redisClient.rPush(`comentarios:post:${postId}`, JSON.stringify(comentario));

        // responder
        return res.status(201).json(comentario);

    } catch (err) {
        console.error("Error al guardar comentario:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

export default postComment;

