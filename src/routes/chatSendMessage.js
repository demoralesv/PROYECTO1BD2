//envia un mensaje al chat que existe en modo append

import redisClient from "../databases/redis.js";

export async function sendMessage(req, res) {
  try {
    const { chatId } = req.params;
    const { userId, mensaje } = req.body;

    if (!chatId || !userId || !mensaje)
      return res.status(400).json({ error: "Missing data" });

    const msg = {
      userId,
      mensaje,
      fecha: Date.now(),
    };

    await redisClient.rPush(`chat:${chatId}`, JSON.stringify(msg));

    return res.status(201).json({ message: "Message sent", data: msg });
  } catch (err) {
    console.error("Error sending message:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default sendMessage;
