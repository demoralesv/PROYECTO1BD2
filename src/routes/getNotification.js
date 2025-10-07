import redisClient from "../databases/redis.js";

export async function getNotifications(userId) {
  if (!userId) return [];

  const raw = await redisClient.lRange(`notificaciones:user:${userId}`, 0, -1);
  return raw.map(n => JSON.parse(n));
}
