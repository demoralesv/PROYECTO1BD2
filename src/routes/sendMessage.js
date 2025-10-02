import redisClient from '../databases/redis.js'
import { Router } from "express";

const router = Router()

export async function sendMessage(req, res) {
    try {
        // valores desde el request
        const { texto, idAutor } = req.body;
        const { conversationID } = req.params;

        // validaciones simples
        if (!texto || !idAutor || conversationID) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        // creacion del comentario
        const mensaje = {
            texto,
            idAutor,
            fecha: Date.now()
        };

        // guardar en Redis
        await redisClient.rPush(`conversaciones:id:${conversationID}`, JSON.stringify(mensaje));

        // responder
        return res.status(201).json(mensaje);

    } catch (err) {
        console.error("Error al guardar mesnaje:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

export default postComment;

