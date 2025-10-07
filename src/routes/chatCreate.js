//Genera la conversacion y guarda las keys de cada user

import redisClient from "../databases/redis.js";
import { randomUUID } from "crypto";

export async function createChat(req, res) {
  try {
    const { userA, userB } = req.body;
    if (!userA || !userB)
      return res.status(400).json({ error: "Missing user IDs" });

    const chatId = randomUUID();
    const chatKey = `chat:${chatId}`;

    // Guardar referencias del chat en cada usuario
    await Promise.all([
      redisClient.rPush(`user:${userA}:chats`, chatKey),
      redisClient.rPush(`user:${userB}:chats`, chatKey),
    ]);

    return res.status(201).json({
      chatId,
      users: [userA, userB],
      message: "Chat created successfully",
    });
  } catch (err) {
    console.error("Error creating chat:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default createChat;
