import { Router } from "express";
import { verifyToken } from "./auth.routes.js";
import User from "../models/User.js";

import redisClient from "../databases/redis.js";
import { randomUUID } from "crypto";
import { getMessages } from "./chatGetMessages.js";
import { sendMessage as sendMsgAppend } from "./chatSendMessage.js";
import { uploadChatMedia, streamChatAsset } from "./chatMedia.js";

const router = Router();

function keyToId(chatKey) {
  return (chatKey || "").replace(/^chat:/, "");
}

/**
 * Create or reuse a 1:1 chat with a target username.
 * POST /api/chat/start/:username
 */
router.post("/api/chat/start/:username", verifyToken, async (req, res) => {
  try {
    const me = await User.findById(req.userId, {
      _id: 1,
      username: 1,
      avatarUrl: 1,
    }).lean();
    if (!me) return res.status(404).json({ error: "User not found" });

    const target = await User.findOne(
      { username: req.params.username },
      { _id: 1, username: 1, avatarUrl: 1 }
    ).lean();
    if (!target)
      return res.status(404).json({ error: "Target user not found" });
    if (String(target._id) === String(me._id))
      return res.status(400).json({ error: "Cannot chat with yourself" });

    // Revisar si existe un chat entre los usuarios
    const myChats = await redisClient.lRange(`user:${me._id}:chats`, 0, -1);
    const theirChats = new Set(
      await redisClient.lRange(`user:${target._id}:chats`, 0, -1)
    );
    const existing = myChats.find((k) => theirChats.has(k));

    if (existing) {
      const chatId = keyToId(existing);
      return res.status(200).json({ chatId, reused: true });
    }
    if (req.params.username.toLowerCase() === "system") {
      return res
        .status(400)
        .json({ error: "Cannot start a chat with System." });
    }

    // Crear nuevo chat
    const chatId = randomUUID();
    const chatKey = `chat:${chatId}`;

    await Promise.all([
      redisClient.rPush(`user:${me._id}:chats`, chatKey),
      redisClient.rPush(`user:${target._id}:chats`, chatKey),

      redisClient.set(
        `chat:${chatId}:meta`,
        JSON.stringify({
          users: [String(me._id), String(target._id)],
          createdAt: Date.now(),
        })
      ),
    ]);

    return res.status(201).json({ chatId, reused: false });
  } catch (e) {
    console.error("chat/start error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * List my chats (with peer info)
 * GET /api/chat
 */
router.get("/api/chat", verifyToken, async (req, res) => {
  try {
    const chatKeys = await redisClient.lRange(
      `user:${req.userId}:chats`,
      0,
      -1
    );
    const result = [];

    for (const ck of chatKeys) {
      const chatId = keyToId(ck);
      const raw = await redisClient.get(`chat:${chatId}:meta`);
      let meta = {};
      try {
        meta = JSON.parse(raw || "{}");
      } catch {}

      const users = (meta.users || []).map(String);
      const system = !!meta.system;
      const wl = Array.isArray(meta.writeWhitelist)
        ? meta.writeWhitelist.map(String)
        : null;

      const myId = String(req.userId);
      const peerRawId = users.find((u) => u !== myId);

      let peer = null;

      if (system) {
        // Usuario system
        peer = {
          id: "__system__",
          username: "system",
          fullname: "System",
          avatarUrl: "https://api.dicebear.com/8.x/identicon/svg?seed=System",
        };
      } else if (peerRawId) {
        // Chat normal
        const doc = await User.findById(peerRawId, {
          _id: 1,
          username: 1,
          avatarUrl: 1,
          fullname: 1,
        }).lean();
        if (doc) {
          peer = {
            id: String(doc._id),
            username: doc.username,
            fullname: doc.fullname,
            avatarUrl: doc.avatarUrl,
          };
        }
      }

      const canWrite = !wl || wl.includes(myId);
      result.push({ chatId, peer, meta: { system, canWrite } });
    }

    res.json({ total: result.length, chats: result });
  } catch (e) {
    console.error("chat list error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get messages of a chat
 * GET /api/chat/:chatId/messages
 */
router.get("/api/chat/:chatId/messages", verifyToken, async (req, res) => {
  return getMessages(req, res);
});

/**
 * Send message to a chat
 * POST /api/chat/:chatId/messages
 * body: { mensaje: string }
 */
router.post("/api/chat/:chatId/messages", verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const senderId = String(req.userId);

    const raw = await redisClient.get(`chat:${chatId}:meta`);
    const meta = JSON.parse(raw || "{}");
    const wl = Array.isArray(meta.writeWhitelist)
      ? meta.writeWhitelist.map(String)
      : null;

    if (meta.system === true && wl && !wl.includes(senderId)) {
      return res.status(403).json({ error: "Read-only conversation." });
    }

    req.body.userId = senderId;
    return sendMsgAppend(req, res);
  } catch (e) {
    console.error("send error", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/chat/:chatId/media", ...uploadChatMedia);

router.get("/api/chat/:chatId/assets/:id", ...streamChatAsset);

export default router;
