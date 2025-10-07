import redisClient from "../databases/redis.js";

export async function markAsRead(userId, notifId) {
  const raw = await redisClient.lRange(`notificaciones:user:${userId}`, 0, -1);

  for (let i = 0; i < raw.length; i++) {
    const n = JSON.parse(raw[i]);
    if (n.id === notifId) {
      n.leido = true;
      await redisClient.lSet(`notificaciones:user:${userId}`, i, JSON.stringify(n));
      return n;
    }
  }
  return null;
}
