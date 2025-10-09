import driver from "../databases/neo4j.js";
import User from "../models/User.js";
import redisClient from "../databases/redis.js";
import { ensureSystemChatFor } from "./systemChat.js";
import { incBadge } from "../routes/addNotification.js";

async function sendSystemMessage(chatId, text) {
  const msg = { userId: "__system__", mensaje: text, fecha: Date.now() };
  await redisClient.rPush(`chat:${chatId}`, JSON.stringify(msg));

  // Mostrar como no leido a los usuarios
  const raw = await redisClient.get(`chat:${chatId}:meta`);
  const users = (JSON.parse(raw || "{}").users || []).map(String);
  const recipients = users.filter((u) => u !== "__system__");
  await Promise.all(recipients.map((u) => incBadge(String(u), "mensaje")));
}

export async function notifyFollowersOfApproval({ ownerMongoId, dataset }) {
  const session = driver.session({ defaultAccessMode: "READ" });
  try {
    const owner = await User.findById(ownerMongoId, {
      _id: 1,
      username: 1,
      fullname: 1,
    }).lean();
    if (!owner) return;

    // Buscar los seguidores en Neo4j
    const neo = await session.executeRead((tx) =>
      tx.run(
        `MATCH (f:User)-[:Friends]->(owner:User {ID: $ownerUsername})
       RETURN f.ID AS followerUsername`,
        { ownerUsername: owner.username }
      )
    );

    const followerUsernames = neo.records
      .map((r) => r.get("followerUsername"))
      .filter(Boolean);
    if (!followerUsernames.length) return;

    // Buscar los usernames
    const followers = await User.find(
      { username: { $in: followerUsernames } },
      { _id: 1, username: 1 }
    ).lean();
    if (!followers.length) return;

    // Crear el mensaje de texto
    const url = `/dataset/${encodeURIComponent(
      dataset.datasetId || dataset._id
    )}`;
    const who = owner.fullname || owner.username;
    const title = dataset.name || "New dataset";
    const text = `🔔 ${who} just published a new dataset: “${title}”.`;

    // Crear o reusar el chat con system
    for (const f of followers) {
      const chatId = await ensureSystemChatFor(f._id);
      await sendSystemMessage(chatId, text);
    }
  } finally {
    await session.close();
  }
}
