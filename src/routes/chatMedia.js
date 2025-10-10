import multer from "multer";
import { cassandraClient } from "../databases/cassandra.js";
import { types as cassTypes } from "cassandra-driver";
import { verifyToken } from "./auth.routes.js";
import jwt from "jsonwebtoken";
const ASSET_JWT_SECRET = process.env.ASSET_JWT_SECRET;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB por archivo
});

const ALLOWED = {
  image: new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]),
  video: new Set(["video/mp4", "video/webm", "video/ogg"]),
  file: new Set(["application/pdf", "text/plain"]),
};

function detectKind(ct) {
  if (!ct) return "file";
  if (ct.startsWith("image/")) return "image";
  if (ct.startsWith("video/")) return "video";
  return "file";
}

// Subir videos e imágenes
export const uploadChatMedia = [
  verifyToken,
  upload.array("files", 6),
  async (req, res) => {
    try {
      const { chatId } = req.params;
      if (!chatId) return res.status(400).json({ error: "chatId required" });

      const files = req.files || [];
      if (!files.length)
        return res.status(400).json({ error: "No files uploaded" });

      const MAX_TOTAL = 40 * 1024 * 1024;
      const total = files.reduce((a, f) => a + (f.size || 0), 0);
      if (total > MAX_TOTAL) {
        return res.status(413).json({
          error: `Combined size exceeds ${Math.floor(
            MAX_TOTAL / 1024 / 1024
          )} MB.`,
        });
      }

      const insert = `
        INSERT INTO chat_assets (chat_id, id, kind, name, content_type, bytes, blob_data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, toTimestamp(now()))
      `;
        const payload = { cid: chatId, aid: id.toString() };
        const token = jwt.sign(payload, ASSET_JWT_SECRET, { expiresIn: "10m" });
        const url = `/api/chat/${encodeURIComponent(chatId)}/assets/${id.toString()}?a=${encodeURIComponent(token)}`;
        saved.push({ id: id.toString(), kind, contentType: ct, name: f.originalname, url });
        const saved = [];
    for (const f of files) {
        const ct = f.mimetype || "application/octet-stream";
        const kind = detectKind(ct);

        const ok = ALLOWED[kind] && ALLOWED[kind].has(ct);
        if (!ok)
          return res
            .status(415)
            .json({ error: `Unsupported content-type: ${ct}` });

        const id = cassTypes.TimeUuid.now();
        await cassandraClient.execute(
          insert,
          [
            chatId,
            id,
            kind,
            f.originalname,
            ct,
            cassTypes.Long.fromNumber(f.size || 0),
            f.buffer,
          ],
          { prepare: true }
        );

        const url = `/api/chat/${encodeURIComponent(
          chatId
        )}/assets/${id.toString()}`;
        saved.push({
          id: id.toString(),
          kind,
          contentType: ct,
          name: f.originalname,
          url,
        });
      }

      res.json({ ok: true, assets: saved });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  },
];

// Obtener imágenes y videos
export const streamChatAsset = [
  verifyToken,
  async (req, res) => {
    try {
      const { chatId, id } = req.params;

      const row = await cassandraClient
        .execute(
          `SELECT content_type, bytes, blob_data FROM chat_assets WHERE chat_id=? AND id=?`,
          [chatId, cassTypes.TimeUuid.fromString(id)],
          { prepare: true }
        )
        .then((r) => r.first());

      if (!row) return res.status(404).end();

      const ct = row.get("content_type") || "application/octet-stream";
      const len = Number(row.get("bytes"));
      const buf = row.get("blob_data");

      const range = req.headers.range;
      if (ct.startsWith("video/") && range) {
        const m = range.match(/bytes=(\d+)-(\d*)/);
        const start = m ? parseInt(m[1], 10) : 0;
        const end = m && m[2] ? parseInt(m[2], 10) : len - 1;
        const chunk = buf.subarray(start, end + 1);

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${len}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunk.length,
          "Content-Type": ct,
        });
        return res.end(chunk);
      }

      res.writeHead(200, { "Content-Type": ct, "Content-Length": len });
      return res.end(buf);
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  },
];
