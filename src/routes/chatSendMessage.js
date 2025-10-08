//envia un mensaje al chat que existe en modo append

import redisClient from "../databases/redis.js";
import { incBadge } from "./addNotification.js";

export async function sendMessage(req, res) {
  try {
    const { chatId } = req.params;
    const { userId, mensaje } = req.body;

    if (!chatId || !userId || !mensaje) {
      return res.status(400).json({ error: "Missing data" });
    }

    const senderId = String(userId);

    const msg = {
      userId: senderId,
      mensaje: String(mensaje),
      fecha: Date.now(),
    };

    // Guardar el mensaje
    await redisClient.rPush(`chat:${chatId}`, JSON.stringify(msg));

    // Incrementar cantidad de mensajes nuevos
    let users = [];
    try {
      const metaRaw = await redisClient.get(`chat:${chatId}:meta`);
      users = JSON.parse(metaRaw || "{}").users || [];
    } catch (_) {
      users = [];
    }
    const recipients = users.filter((u) => String(u) !== senderId);

    if (recipients.length) {
      await Promise.all(recipients.map((u) => incBadge(String(u), "mensaje")));
    }

    // Responder
    return res.status(201).json({ message: "Message sent", data: msg });
  } catch (err) {
    console.error("Error sending message:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default sendMessage;
