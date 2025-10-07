//obtiene todos los ids de chats a los que pertenece el mae

import redisClient from "../databases/redis.js";

export async function getUserChats(req, res) {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ error: "Missing userId" });

    const chats = await redisClient.lRange(`user:${userId}:chats`, 0, -1);

    return res.status(200).json({
      userId,
      total: chats.length,
      chats,
    });
  } catch (err) {
    console.error("Error getting user chats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default getUserChats;
