import redisClient from "../databases/redis.js";
import { randomUUID } from "crypto";

/**
 * Agrega una notificación a un usuario
 * se llama desde index.js cuando hay evento
 */
export async function addNotification(userId, tipo, origen, texto) {
  if (!userId || !tipo || !origen || !texto) return null;

  const notif = {
    id: randomUUID(),
    tipo,
    origen,
    texto,
    leido: false,
    fecha: Date.now(),
  };

  await redisClient.rPush(`notificaciones:user:${userId}`, JSON.stringify(notif));
  await redisClient.lTrim(`notificaciones:user:${userId}`, -100, -1); // últimos 100

  return notif;
}

