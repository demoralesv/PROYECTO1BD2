// Envía un mensaje al chat que existe en modo append

import redisClient from "../databases/redis.js";
import { incBadge } from "./addNotification.js";

export async function sendMessage(req, res) {
  try {
    const { chatId } = req.params;
    const { userId, mensaje, attachments } = req.body;

    const atts = Array.isArray(attachments) ? attachments : [];

    if (!chatId || !userId || (!mensaje && atts.length === 0)) {
      return res.status(400).json({ error: "Missing data" });
    }

    const senderId = String(userId);

    const msg = {
      userId: senderId,
      mensaje: String(mensaje || ""),
      attachments: atts.map((a) => ({
        id: String(a.id),
        kind: String(a.kind),
        contentType: String(a.contentType || ""),
        name: String(a.name || ""),
        url: String(a.url || ""),
      })),
      fecha: Date.now(),
    };

    // Guardar mensaje
    await redisClient.rPush(`chat:${chatId}`, JSON.stringify(msg));

    // Notificar al usuario en la conversación
    let users = [];
    try {
      const metaRaw = await redisClient.get(`chat:${chatId}:meta`);
      users = JSON.parse(metaRaw || "{}").users || [];
    } catch {
      users = [];
    }
    const recipients = users.filter((u) => String(u) !== senderId);
    if (recipients.length) {
      await Promise.all(recipients.map((u) => incBadge(String(u), "mensaje")));
    }

    return res.status(201).json({ message: "Message sent", data: msg });
  } catch (err) {
    console.error("Error sending message:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default sendMessage;
