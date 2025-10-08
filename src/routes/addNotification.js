import redisClient from "../databases/redis.js";
import { randomUUID } from "crypto";

/**
 * Agrega una notificación a un usuario
 * se llama desde index.js cuando hay evento
 */

export async function incBadge(userId, type = "mensaje") {
  await redisClient.incr(`badge:${type}:user:${userId}`);
}

export async function getBadgeCounts(userId) {
  const messages =
    Number(await redisClient.get(`badge:mensaje:user:${userId}`)) || 0;
  return { messages };
}

export async function clearBadge(userId, type = "mensaje") {
  await redisClient.set(`badge:${type}:user:${userId}`, 0);
}

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

  await redisClient.rPush(
    `notificaciones:user:${userId}`,
    JSON.stringify(notif)
  );
  await redisClient.lTrim(`notificaciones:user:${userId}`, -100, -1); // últimos 100

  return notif;
}
