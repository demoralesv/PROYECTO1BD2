//jala todos los mensajes dado el id de un chat

import redisClient from "../databases/redis.js";

export async function getMessages(req, res) {
  try {
    const { chatId } = req.params;
    if (!chatId)
      return res.status(400).json({ error: "Missing chatId" });

    const raw = await redisClient.lRange(`chat:${chatId}`, 0, -1);

    const mensajes = raw.map((m) => {
      try {
        return JSON.parse(m);
      } catch {
        return null;
      }
    }).filter(Boolean);

    return res.status(200).json({
      chatId,
      total: mensajes.length,
      mensajes,
    });
  } catch (err) {
    console.error("Error getting messages:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default getMessages;
