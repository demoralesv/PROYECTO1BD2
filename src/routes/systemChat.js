import redisClient from "../databases/redis.js";
import { randomUUID } from "crypto";
import User from "../models/User.js";

function keyToId(chatKey) {
  return (chatKey || "").replace(/^chat:/, "");
}

export async function ensureSystemChatFor(recipientMongoId) {
  const recipientId = String(recipientMongoId || "").trim();
  if (!recipientId) throw new Error("recipientMongoId required");

  // Volver a usar el mismo chat si ya existe
  const myChats = await redisClient.lRange(`user:${recipientId}:chats`, 0, -1);
  for (const ck of myChats) {
    const chatId = keyToId(ck);
    const raw = await redisClient.get(`chat:${chatId}:meta`);
    if (!raw) continue;
    try {
      const meta = JSON.parse(raw);
      const users = (meta.users || []).map(String);
      if (
        meta.system === true &&
        users.includes("__system__") &&
        users.includes(recipientId)
      ) {
        return chatId;
      }
    } catch {}
  }

  // Crear un nuevo chat
  const chatId = randomUUID();
  const chatKey = `chat:${chatId}`;

  await Promise.all([
    redisClient.rPush(`user:${recipientId}:chats`, chatKey),
    redisClient.set(
      `chat:${chatId}:meta`,
      JSON.stringify({
        users: ["__system__", recipientId],
        createdAt: Date.now(),
        system: true,
        writeWhitelist: ["__system__"],
      })
    ),
  ]);

  return chatId;
}
