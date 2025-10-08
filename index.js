// server.js
import express, { json } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import mime from "mime-types";
import archiver from "archiver";
import { types as cassTypes } from "cassandra-driver";
import { v5 as uuidv5 } from "uuid";
import User from "./src/models/User.js";
import Dataset from "./src/models/Dataset.js";
import login from "./web/pages/login/login.js";
import signup from "./web/pages/signup/signup.js";
import profile from "./web/pages/profile/profile.js";
import home from "./web/pages/Home/home.js";
import profileEdit from "./web/pages/profile/edit.js";
import createDataset from "./web/pages/Datasets/createDataset/createDataset.js";
import datasetView from "./web/pages/Datasets/Details/details.js";
import datasetEdit from "./web/pages/Datasets/Edit/datasetEdit.js";
import connectDB from "./src/databases/mongo.js";
import followers from "./web/pages/Followers-Following/Followers/followers.js";
import following from "./web/pages/Followers-Following/Following/following.js";
import chatPage from "./web/pages/Chat/chat.js";
import searchPage from "./web/pages/Search/search.js";
import downloadsPage from "./web/pages/Downloads/downloads.js";
import getFollowers from "./src/routes/getFollowers.js";
import getFollowing from "./src/routes/getFollowing.js";
import profilePublic from "./web/pages/profile/profilePublic.js";
import getUserProfile from "./src/routes/getUserProfile.js";
import searchRouter from "./src/routes/search.js";
import neo4j from "neo4j-driver";

import { verifyToken } from "./src/routes/auth.routes.js";
import { tryAuth } from "./src/routes/auth.routes.js";
import { initCassandra, cassandraClient } from "./src/databases/cassandra.js";
import redisClient from "./src/databases/redis.js";
import { initNeo4j } from "./src/databases/neo4j.js";
import updateRouter from "./src/routes/updateProfile.js";
import datasetApproved from "./src/routes/datasetsApproved.js";
import driver from "./src/databases/neo4j.js";
import { getFollowCounts } from "./src/routes/getFollowCounts.js";
import { postComment } from "./src/routes/createComment.js";
import { getComments } from "./src/routes/getComments.js";
import { deleteComment } from "./src/routes/deleteComment.js";
import adminPanel from "./web/pages/Admin/adminPanel.js";
import makeAdmins from "./web/pages/Admin/makeAdmins.js";
import approveDS from "./web/pages/Admin/approveDS.js";
import adminRoutes from "./src/routes/adminController.js";
import manageDatasets from "./src/routes/manageDatasets.js";
import startFollowing from "./src/routes/startFollowing.js";

//Chats
import createChat from "./src/routes/chatCreate.js";
import sendMessage from "./src/routes/chatSendMessage.js";
import getMessages from "./src/routes/chatGetMessages.js";
import getUserChats from "./src/routes/chatGetUserChats.js";
import chatRoutes from "./src/routes/chat.routes.js";
import badgesRouter from "./src/routes/badge.routes.js";

//servicio de notificaciones
import { addNotification } from "./src/routes/addNotification.js";
import { getNotifications } from "./src/routes/getNotification.js";
import { markAsRead } from "./src/routes/markReadNotification.js";

const MAX_TOTAL_BYTES = 15 * 1024 * 1024;

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.static("pages"));
// Middleware to parse JSON
app.use(express.json());
app.use(searchRouter);
app.use(chatRoutes);
connectDB();
await initCassandra();
await initNeo4j();
//Redis se conecta solo al iniciar el proyecto
// rutas, definen que hace cuando se le agrega /algo a la url
// Home = login

await User.syncIndexes();
await Dataset.syncIndexes();
console.log("✅ Indexes synced");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

app.get("/", (req, res) => {
  res.send(login());
});
// Signup
app.get("/signup", (req, res) => {
  res.send(signup());
});
// Home
app.get("/home", (req, res) => {
  res.send(home());
});
// Perfil del usuario
app.get("/profile", (req, res) => {
  res.send(profile());
});
app.get("/profile/edit", (req, res) => {
  res.send(profileEdit());
});
app.get("/profile/:username", (req, res) => {
  res.send(profilePublic());
});
//admin panel
app.get("/admin", (req, res) => {
  res.send(adminPanel());
});
app.get("/manageUsers", (req, res) => {
  res.send(makeAdmins());
});
app.get("/manageDatasets", (req, res) => {
  res.send(approveDS());
});
//ver seguidores
app.get("/followers", (req, res) => {
  res.send(followers());
});
//ver siguiendo
app.get("/following", (req, res) => {
  res.send(following());
});
// Chats
app.get("/chat", (req, res) => {
  res.send(chatPage());
});

// Crear un dataset
app.get("/datasets/new", (req, res) => {
  res.send(createDataset());
});

// Info de un dataset
app.get("/datasets/:id", (req, res) => {
  res.send(datasetView());
});

//Buscar datasets o usuarios
app.get("/search", (req, res) => {
  res.send(searchPage());
});

//Editar datasets
app.get("/datasets/:id/edit", (req, res) => {
  res.send(datasetEdit());
});

// Página de usuarios que han descargado un dataset
app.get("/datasets/:id/downloads", (req, res) => {
  res.send(downloadsPage());
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "Invalid Data" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid Data" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.json({ msg: "Login succesfully ✅", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { username, password, fullname, birthDate, avatarUrl } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Please fill all fields" });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Username not available" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      fullname,
      birthDate,
      avatarUrl,
    });
    await user.save();

    //crear nodo en neo4j
    const session = driver.session();
    try {
      await session.run(`MERGE (s:User {ID: $username})`, {
        username: user.username,
      });
    } finally {
      await session.close();
    }

    res.json({ msg: "User Created✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Info del usuario que ya ingresó
app.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    const { followers, following } = await getFollowCounts(user.username);
    res.json({
      username: user.username,
      fullName: user.fullname,
      dob: user.birthDate || null,
      avatarUrl: user.avatarUrl || null,
      stats: { files: 0, followers, following },
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Crear un dataset
app.post("/datasets", verifyToken, async (req, res) => {
  const session = driver.session();
  try {
    const { name, description, datasetAvatarUrl } = req.body;
    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "Name and description are required" });
    }

    const ds = new Dataset({
      owner: req.userId, // comes from verifyToken
      name,
      description,
      datasetAvatarUrl: datasetAvatarUrl || null,
    });

    await ds.save();

    // Crear un nodo en Neo4j
    const params = {
      id: ds._id.toString(),
      userId: req.userId.toString(),
      name: ds.name,
      avatar: ds.datasetAvatarUrl || null,
      createdAt: ds.createdAt.toISOString(),
    };

    await session.executeWrite((tx) =>
      tx.run(
        `
        MERGE (d:Dataset {ID: $id})
        ON CREATE SET
          d.UserID          = $userId,
          d.name            = $name,
          d.downloadsCount  = 0,
          d.ratingCount     = 0,
          d.ratingSum       = 0,
          d.ratingAvg       = 0.0,
          d.createdAt       = $createdAt
        `,
        params
      )
    );

    res.json({
      _id: ds._id,
      name: ds.name,
      description: ds.description,
      datasetAvatarUrl: ds.datasetAvatarUrl,
      status: ds.status,
      owner: ds.owner,
      createdAt: ds.createdAt,
      updatedAt: ds.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});
// Cambiar estado de dataset a Submitted
app.post("/api/datasets/:id/submit", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Encontrar por ID del dataset y después por el del objeto
    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ datasetId: id }, { _id: id }] }
      : { datasetId: id };

    const ds = await Dataset.findOne(query);
    if (!ds) return res.status(404).json({ error: "Dataset not found" });
    if (String(ds.owner) !== String(req.userId)) {
      return res.status(403).json({ error: "Not your dataset" });
    }

    ds.status = "submitted";
    await ds.save();

    res.json({ ok: true, status: ds.status, updatedAt: ds.updatedAt });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Poner en Pending cuando se hacen cambios
app.put("/api/datasets/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, datasetAvatarUrl } = req.body;

    const query = mongoose.isValidObjectId(id)
      ? { $or: [{ datasetId: id }, { _id: id }] }
      : { datasetId: id };
    const ds = await Dataset.findOne(query);
    if (!ds) return res.status(404).json({ error: "Dataset not found" });
    if (String(ds.owner) !== String(req.userId)) {
      return res.status(403).json({ error: "Not your dataset" });
    }

    if (name) ds.name = name;
    if (description) ds.description = description;
    ds.datasetAvatarUrl = datasetAvatarUrl ?? ds.datasetAvatarUrl;
    ds.status = "pending";

    await ds.save();

    res.json({
      id: String(ds._id),
      datasetId: ds.datasetId,
      name: ds.name,
      description: ds.description,
      datasetAvatarUrl: ds.datasetAvatarUrl || null,
      status: ds.status,
      updatedAt: ds.updatedAt,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Obtener los datasets (míos o de otro usuario por username)
app.get("/datasets", verifyToken, async (req, res) => {
  const session = driver.session();
  try {
    const { mine, owner, status } = req.query;
    const filter = {};

    if (String(mine).toLowerCase() === "true") filter.owner = req.userId;
    if (owner) {
      const u = await User.findOne({ username: owner }, { _id: 1 }).lean();
      if (!u) return res.json({ items: [], total: 0 });
      filter.owner = u._id;
    }
    if (status) filter.status = status;

    const items = await Dataset.find(filter).sort({ createdAt: -1 }).lean();
    const total = await Dataset.countDocuments(filter);

    const ids = items.map((d) => String(d._id));
    let metricsById = new Map();
    if (ids.length) {
      const r = await session.executeRead((tx) =>
        tx.run(
          `
          UNWIND $ids AS id
          OPTIONAL MATCH (d:Dataset {ID:id})
          RETURN id,
                 coalesce(d.ratingAvg,0.0)      AS ratingAvg,
                 coalesce(d.ratingCount,0)       AS ratingCount,
                 coalesce(d.downloadsCount,0)    AS downloadsCount
          `,
          { ids }
        )
      );
      const toNum = (x) =>
        x && typeof x.toNumber === "function" ? x.toNumber() : x;
      for (const rec of r.records) {
        const id = rec.get("id");
        const avg = Number(rec.get("ratingAvg") ?? 0);
        const cnt = toNum(rec.get("ratingCount") ?? 0);
        const dls = toNum(rec.get("downloadsCount") ?? 0);
        metricsById.set(id, {
          ratingAvg: avg,
          ratingCount: cnt,
          downloadsCount: dls,
        });
      }
    }

    res.json({
      items: items.map((d) => {
        const pid = String(d._id);
        const m = metricsById.get(pid) || {
          ratingAvg: 0,
          ratingCount: 0,
          downloadsCount: 0,
        };
        return {
          _id: pid,
          id: pid,
          datasetId: d.datasetId,
          name: d.name,
          description: d.description,
          status: d.status,
          ratingAvg: m.ratingAvg,
          ratingCount: m.ratingCount,
          downloadsCount: m.downloadsCount,
        };
      }),
      total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});
// Obtener info de un dataset
app.get("/api/datasets/:id", tryAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Buscar por ID dado
    let ds = await Dataset.findOne({ datasetId: id })
      .populate({
        path: "owner",
        select: "username fullname fullName avatarUrl",
      })
      .lean();

    // 2) Si no lo encuentra, buscar por ID de objeto
    if (!ds && mongoose.isValidObjectId(id)) {
      ds = await Dataset.findById(id)
        .populate({
          path: "owner",
          select: "username fullname fullName avatarUrl",
        })
        .lean();
    }

    if (!ds) return res.status(404).json({ error: "Dataset not found" });

    const ownerId = String(ds.owner?._id || ds.owner || "");
    const meId = req.userId ? String(req.userId) : "";
    const canEdit = ownerId && meId && ownerId === meId;

    const pid = String(ds._id);

    const session = driver.session();
    try {
      const dsId = String(ds._id);
      const meId = req.userId ? String(req.userId) : null;

      const neo = await session.executeRead((tx) =>
        tx.run(
          `
          WITH 1 AS _
          OPTIONAL MATCH (d:Dataset {ID:$dsId})
          OPTIONAL MATCH (me:User {ID:$meId})-[mv:VOTED]->(d)
          RETURN
            coalesce(d.ratingCount, 0)    AS ratingCount,
            coalesce(d.ratingAvg,   0.0)  AS ratingAvg,
            coalesce(d.downloadsCount, 0) AS downloadsCount,
            mv.value                       AS myVote
          `,
          { dsId, meId }
        )
      );

      const rec = neo.records[0];
      const toNum = (x) =>
        x && typeof x.toNumber === "function" ? x.toNumber() : x;

      const ratingCount = rec ? toNum(rec.get("ratingCount")) : 0;
      const ratingAvg = rec ? Number(rec.get("ratingAvg") ?? 0) : 0;
      const downloadsCount = rec ? toNum(rec.get("downloadsCount")) : 0;
      const myVote = rec ? toNum(rec.get("myVote")) : null;

      return res.json({
        _id: String(ds._id),
        id: String(ds._id),
        datasetId: ds.datasetId || String(ds._id),
        name: ds.name,
        description: ds.description,
        datasetAvatarUrl: ds.datasetAvatarUrl || null,
        status: ds.status,
        owner: ds.owner
          ? {
              id: String(ds.owner._id),
              username: ds.owner.username || "",
              fullName: ds.owner.fullname || ds.owner.fullName || "",
              avatarUrl: ds.owner.avatarUrl || null,
            }
          : null,
        files: [],
        videos: [],
        createdAt: ds.createdAt,
        updatedAt: ds.updatedAt,
        ratingAvg,
        ratingCount,
        downloadsCount,
        myVote,
      });
    } finally {
      await session.close();
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Votos en un dataset
app.post("/api/datasets/:id/votes", verifyToken, async (req, res) => {
  const session = driver.session();
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ error: "value must be an integer 1..5" });
    }

    let ds = await Dataset.findOne({ datasetId: id }).lean();
    if (!ds && mongoose.isValidObjectId(id))
      ds = await Dataset.findById(id).lean();
    if (!ds) return res.status(404).json({ error: "Dataset not found" });
    if (String(ds.owner) === String(req.userId)) {
      return res
        .status(403)
        .json({ error: "Owners cannot vote their own dataset" });
    }

    const dsId = String(ds._id);
    const userId = String(req.userId);

    const result = await session.executeWrite(async (tx) => {
      await tx.run(`MERGE (:User {ID:$userId})`, { userId });
      await tx.run(`MERGE (:Dataset {ID:$dsId})`, { dsId });

      const r = await tx.run(
        `
        MATCH (u:User {ID:$userId}), (d:Dataset {ID:$dsId})
        MERGE (u)-[v:VOTED]->(d)
        ON CREATE SET
          v.value = $value, v.at = datetime(),
          d.ratingCount = coalesce(d.ratingCount,0) + 1,
          d.ratingSum   = coalesce(d.ratingSum,0) + $value
        ON MATCH
          SET v.prev = v.value,
              v.value = $value, v.at = datetime(),
              d.ratingSum = coalesce(d.ratingSum,0) + $value - coalesce(v.prev,0)
        WITH d
        SET d.ratingAvg =
          CASE WHEN coalesce(d.ratingCount,0) = 0 THEN 0.0
               ELSE toFloat(coalesce(d.ratingSum,0)) / toFloat(d.ratingCount)
          END
        RETURN coalesce(d.ratingAvg,0.0) AS ratingAvg,
               coalesce(d.ratingCount,0) AS ratingCount
        `,
        { userId, dsId, value }
      );

      const rec = r.records[0];
      const toNum = (x) =>
        x && typeof x.toNumber === "function" ? x.toNumber() : x;

      return {
        ratingAvg: Number(rec?.get("ratingAvg") ?? 0),
        ratingCount: toNum(rec?.get("ratingCount") ?? 0),
      };
    });

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await session.close();
  }
});
// El ID del dataset
function isMongoObjectId(s) {
  return /^[0-9a-fA-F]{24}$/.test(s || "");
}
// UUID para guardar los files en Cassandra
const DATASET_UUID_NAMESPACE =
  process.env.DATASET_UUID_NAMESPACE || "3a2bbf3f-7b7c-4f9a-a44b-9f2a8e1f1e10";
// Convertir el ID del objeto a un UUID
function objectIdToUuid(oid) {
  return uuidv5(oid.toLowerCase(), DATASET_UUID_NAMESPACE);
}
// Guardar archivos y videos en la BD
app.post(
  "/datasets/:datasetId/assets",
  verifyToken,
  upload.fields([
    { name: "files", maxCount: 100 },
    { name: "videos", maxCount: 100 },
  ]),
  async (req, res) => {
    try {
      const { datasetId } = req.params;
      if (!datasetId)
        return res.status(400).json({ error: "datasetId is required" });
      if (!isMongoObjectId(datasetId))
        return res
          .status(400)
          .json({ error: "datasetId must be a 24-hex Mongo ObjectId" });

      const datasetUUID = cassTypes.Uuid.fromString(objectIdToUuid(datasetId));

      const files = req.files?.files || [];
      const videos = req.files?.videos || [];
      if (files.length === 0 && videos.length === 0) {
        return res.status(400).json({ error: "No assets uploaded" });
      }

      const totalBytes = [...files, ...videos].reduce(
        (a, f) => a + (f.size || 0),
        0
      );
      if (totalBytes > MAX_TOTAL_BYTES) {
        return res.status(413).json({
          error:
            "Combined size exceeds " +
            MAX_TOTAL_BYTES +
            " MB. Please upload fewer/smaller files.",
        });
      }

      const insert = `
        INSERT INTO files (dataset_id, id, kind, name, creation_date, amount_of_bytes, blob_data)
        VALUES (?, ?, ?, ?, toTimestamp(now()), ?, ?)
      `;

      // Agregar archivos
      for (const f of files) {
        await cassandraClient.execute(
          insert,
          [
            datasetUUID,
            cassTypes.TimeUuid.now(),
            "file",
            f.originalname,
            cassTypes.Long.fromNumber(f.size || 0),
            f.buffer,
          ],
          { prepare: true }
        );
      }
      for (const v of videos) {
        await cassandraClient.execute(
          insert,
          [
            datasetUUID,
            cassTypes.TimeUuid.now(),
            "video",
            v.originalname,
            cassTypes.Long.fromNumber(v.size || 0),
            v.buffer,
          ],
          { prepare: true }
        );
      }

      res.json({
        ok: true,
        uploaded: { files: files.length, videos: videos.length },
      });
    } catch (err) {
      if (
        String(err.message).includes("Request is too big") ||
        err.code === "LIMIT_FILE_SIZE"
      ) {
        return res.status(413).json({
          error:
            "Each upload is limited to " +
            MAX_TOTAL_BYTES / (1024 * 1024) +
            " MB combined.",
        });
      }
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);
// Obtener cantidad total de bytes de archivos
app.get(
  "/datasets/:datasetId/assets/summary",
  verifyToken,
  async (req, res) => {
    try {
      const { datasetId } = req.params;
      if (!isMongoObjectId(datasetId))
        return res.status(400).json({ error: "bad id" });

      const datasetUUID = cassTypes.Uuid.fromString(objectIdToUuid(datasetId));
      const rs = await cassandraClient.execute(
        "SELECT kind, name, amount_of_bytes FROM files WHERE dataset_id = ?",
        [datasetUUID],
        { prepare: true }
      );
      const items = rs.rows || [];
      const totals = items.reduce(
        (acc, r) => {
          const n = Number(
            r.amount_of_bytes?.toString?.() || r.amount_of_bytes || 0
          );
          acc.total += n;
          if (r.kind === "file") acc.files += n;
          else if (r.kind === "video") acc.videos += n;
          return acc;
        },
        { total: 0, files: 0, videos: 0 }
      );

      res.json({ count: items.length, bytes: totals, items });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
);
// Obtener los archivos y videos de un dataset
app.get("/api/datasets/:id/assets", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isMongoObjectId(id)) return res.status(400).json({ error: "bad id" });

    const datasetUUID = cassTypes.Uuid.fromString(objectIdToUuid(id));
    const rs = await cassandraClient.execute(
      "SELECT id, kind, name, amount_of_bytes, creation_date FROM files WHERE dataset_id = ? ORDER BY id ASC",
      [datasetUUID],
      { prepare: true }
    );

    const rows = rs.rows || [];
    const items = rows.map((r) => ({
      assetId: String(r.id),
      kind: r.kind,
      name: r.name,
      bytes: Number(r.amount_of_bytes?.toString?.() || r.amount_of_bytes || 0),
      createdAt: r.creation_date,
    }));

    res.json({
      files: items.filter((x) => x.kind === "file"),
      videos: items.filter((x) => x.kind === "video"),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Obtener el ID o el nombre del dataset
async function getDatasetNameOrId(id) {
  try {
    const ds = await Dataset.findById(id).lean();
    return (ds?.name || String(id)).replace(/[^\w\-.\s]/g, "_").slice(0, 60);
  } catch {
    return String(id);
  }
}
// Revisar que el nombre sea único
function uniqueName(name, used) {
  const safe = (name || "file").replace(/[\/\\]/g, "_");
  if (!used.has(safe)) {
    used.add(safe);
    return safe;
  }
  const ext = path.extname(safe);
  const base = path.basename(safe, ext);
  let i = 2;
  while (used.has(`${base} (${i})${ext}`)) i++;
  const out = `${base} (${i})${ext}`;
  used.add(out);
  return out;
}
// Descargar los archivos
async function recordDownload({ session, userId, datasetId, source, assetId }) {
  const result = await session.executeWrite((tx) =>
    tx.run(
      `
      MERGE (u:User    {ID: $userId})
      MERGE (d:Dataset {ID: $datasetId})
      MERGE (u)-[r:DOWNLOADED]->(d)
      ON CREATE SET r.count = 1, r.firstAt = timestamp(), r.lastAt = timestamp()
      ON MATCH  SET r.count = r.count + 1, r.lastAt = timestamp()
      SET r.source  = coalesce($source, r.source),
          r.assetId = coalesce($assetId, r.assetId),
          d.downloadsCount = coalesce(d.downloadsCount, 0) + 1
      RETURN d.downloadsCount AS downloadsCount, r.count AS userCount
      `,
      { userId: String(userId), datasetId: String(datasetId), source, assetId }
    )
  );

  const rec = result.records[0];
  const toNum = (x) => (x && x.toNumber ? x.toNumber() : x);
  return {
    downloadsCount: toNum(rec.get("downloadsCount")),
    userCount: toNum(rec.get("userCount")),
  };
}
app.post("/api/datasets/:id/track-download", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isMongoObjectId(id)) return res.status(400).json({ error: "bad id" });

    const ds = await Dataset.findById(id).lean();
    if (String(ds?.owner) === String(req.userId))
      return res.json({ ok: true, downloadsCount: null });
    const session = driver.session();

    const { source = "zip", assetId = null } = req.body || {};
    const { downloadsCount, userCount } = await recordDownload({
      session,
      userId: req.userId,
      datasetId: id,
      source,
      assetId,
    });

    res.json({ ok: true, downloadsCount, userCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await session.close();
  }
});
// Descargar .zip
app.get("/api/datasets/:id/download", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isMongoObjectId(id)) return res.status(400).json({ error: "bad id" });

    const datasetUUID = cassTypes.Uuid.fromString(objectIdToUuid(id));

    const rs = await cassandraClient.execute(
      "SELECT id, kind, name, amount_of_bytes, blob_data FROM files WHERE dataset_id = ?",
      [datasetUUID],
      { prepare: true }
    );

    const rows = (rs.rows || []).filter((r) => r.kind === "file");
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No files to download in this dataset" });
    }

    const zipName = (await getDatasetNameOrId(id)) + ".zip";
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(zipName)}"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", (err) => {
      try {
        res.status(500).end();
      } catch {}
    });

    archive.pipe(res);

    const used = new Set();
    for (const r of rows) {
      const fname = uniqueName(r.name || "file", used);
      const size = Number(
        r.amount_of_bytes?.toString?.() || r.amount_of_bytes || 0
      );
      const ct = mime.lookup(fname) || "application/octet-stream";
      archive.append(r.blob_data, {
        name: fname,
        stats: { size },
        mode: 0o100644,
      });
    }

    await archive.finalize();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Lista de usuarios que han descargado un archivo
app.get("/api/datasets/:id/downloads", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (!isMongoObjectId(id)) return res.status(400).json({ error: "bad id" });

  const ds = await Dataset.findById(id).lean();
  if (!ds) return res.status(404).json({ error: "dataset not found" });
  if (String(ds.owner) !== String(req.userId))
    return res
      .status(403)
      .json({ error: "only the owner can view downloaders" });

  const pageQ = Number(req.query.page);
  const sizeQ = Number(req.query.size ?? req.query.limit);
  const page = Number.isFinite(pageQ) && pageQ >= 0 ? Math.floor(pageQ) : 0;
  const size =
    Number.isFinite(sizeQ) && sizeQ > 0 ? Math.min(100, Math.floor(sizeQ)) : 50;
  const skip = page * size;

  const session = driver.session();
  try {
    // Filas
    const r1 = await session.executeRead((tx) =>
      tx.run(
        `
        MATCH (u:User)-[r:DOWNLOADED]->(d:Dataset {ID:$dsId})
        RETURN u.ID AS userId, r.count AS count, r.firstAt AS firstAt, r.lastAt AS lastAt
        ORDER BY r.lastAt DESC
        SKIP toInteger($skip) LIMIT toInteger($limit)
        `,
        { dsId: String(id), skip, limit: size }
      )
    );

    // Totales
    const r2 = await session.executeRead((tx) =>
      tx.run(
        `
        MATCH (u:User)-[r:DOWNLOADED]->(d:Dataset {ID:$dsId})
        RETURN count(DISTINCT u) AS uniqueDownloaders, coalesce(sum(r.count),0) AS totalDownloads
        `,
        { dsId: String(id) }
      )
    );

    const toNum = (x) => (x && x.toNumber ? x.toNumber() : x);

    const itemsRaw = r1.records.map((rec) => ({
      userId: rec.get("userId"),
      count: toNum(rec.get("count")) ?? 0,
      firstAt: toNum(rec.get("firstAt")) ?? null,
      lastAt: toNum(rec.get("lastAt")) ?? null,
    }));

    // Unir con info de MongoDB
    const ids = itemsRaw.map((x) => x.userId).filter(Boolean);
    const users = await User.find(
      { _id: { $in: ids } },
      { _id: 1, username: 1, fullname: 1, fullName: 1, avatarUrl: 1 }
    ).lean();
    const byId = new Map(users.map((u) => [String(u._id), u]));
    const items = itemsRaw.map((row) => {
      const u = byId.get(String(row.userId)) || {};
      return {
        userId: row.userId,
        username: u.username || null,
        fullName: u.fullname || u.fullName || null,
        avatarUrl: u.avatarUrl || null,
        count: row.count,
        firstAt: row.firstAt,
        lastAt: row.lastAt,
      };
    });

    const rec2 = r2.records[0];
    const uniqueDownloaders = rec2
      ? toNum(rec2.get("uniqueDownloaders")) || 0
      : 0;
    const totalDownloads = rec2 ? toNum(rec2.get("totalDownloads")) || 0 : 0;

    res.json({
      page,
      limit: size,
      items,
      total: uniqueDownloaders,
      totals: { uniqueDownloaders, totalDownloads },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await session.close();
  }
});
// Obtener el ID de un archivo
app.get("/api/datasets/:id/assets/:assetId", verifyToken, async (req, res) => {
  try {
    const { id, assetId } = req.params;
    if (!isMongoObjectId(id)) return res.status(400).json({ error: "bad id" });

    const datasetUUID = cassTypes.Uuid.fromString(objectIdToUuid(id));
    const assetUuid = cassTypes.TimeUuid.fromString(assetId);

    const rs = await cassandraClient.execute(
      "SELECT name, kind, amount_of_bytes, blob_data FROM files WHERE dataset_id = ? AND id = ?",
      [datasetUUID, assetUuid],
      { prepare: true }
    );
    const row = rs.rows?.[0];
    if (!row) return res.status(404).json({ error: "Asset not found" });

    const ct = mime.lookup(row.name || "") || "application/octet-stream";

    res.setHeader("Content-Type", ct);
    res.setHeader(
      "Content-Length",
      String(
        Number(
          row.amount_of_bytes?.toString?.() ||
            row.amount_of_bytes ||
            row.blob_data?.length ||
            0
        )
      )
    );

    res.send(row.blob_data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Borrar los comentarios cuando se elimina un dataset
async function deleteAllCommentsForDataset(ds) {
  const keys = new Set();

  const mongoId = String(ds._id);
  keys.add(`comentarios:post:${mongoId}`);

  if (ds.datasetId && String(ds.datasetId) !== mongoId) {
    keys.add(`comentarios:post:${ds.datasetId}`);
  }
  const patterns = [
    `comentarios:post:${mongoId}*`,
    ds.datasetId ? `comentarios:post:${ds.datasetId}*` : null,
  ].filter(Boolean);

  let removed = 0;

  for (const k of keys) removed += await redisClient.del(k);
  for (const p of patterns) {
    for await (const key of redisClient.scanIterator({
      MATCH: p,
      COUNT: 1000,
    })) {
      removed += await redisClient.del(key);
    }
  }

  return removed;
}
//Borrar dataset
app.delete("/api/datasets/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    if (!isMongoObjectId(id)) return res.status(400).json({ error: "bad id" });

    // Encontrar el dataset
    const ds = await Dataset.findById(id);
    if (!ds) return res.status(404).json({ error: "not found" });

    const isOwner = String(ds.owner) === String(req.userId);
    const isAdmin = req.userRole === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "forbidden" });
    }

    const result = {
      mongo: false,
      cassandra: false,
      redis: false,
      neo4j: false,
      warnings: [],
    };

    // Remover info en Mongo
    await Dataset.deleteOne({ _id: id });
    result.mongo = true;

    // Remover archivos de Cassandra
    try {
      const datasetUUID = cassTypes.Uuid.fromString(objectIdToUuid(id));
      await cassandraClient.execute(
        "DELETE FROM files WHERE dataset_id = ?",
        [datasetUUID],
        { prepare: true }
      );
      result.cassandra = true;
    } catch (e) {
      result.warnings.push("Cassandra delete failed: " + e.message);
    }

    // Remover archivos de Redis
    try {
      const removed = await deleteAllCommentsForDataset(ds);
      result.redis = true;
      if (!removed) result.warnings.push("No Redis comment list found.");
    } catch (e) {
      result.warnings.push("Redis delete failed: " + e.message);
    }

    // Remover nodos de Neo4j
    const session = driver.session();
    try {
      const neo = await session.executeWrite((tx) =>
        tx.run(
          `
          MATCH (d:Dataset {ID: $id})
          DETACH DELETE d
          RETURN 1 AS ok
          `,
          { id: String(id) }
        )
      );

      result.neo4j = neo.records.length > 0;
    } catch (e) {
      result.warnings.push("Neo4j delete failed: " + e.message);
    } finally {
      await session.close();
    }

    return res.json({ ok: true, removed: result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});
// Borrar archivos en pantalla de editar
async function deleteAssetHandler(req, res) {
  try {
    const { id: datasetId, assetId } = req.params;
    if (!isMongoObjectId(datasetId))
      return res.status(400).json({ error: "bad id" });
    if (!assetId) return res.status(400).json({ error: "assetId is required" });

    const ds = await Dataset.findById(datasetId).lean();
    if (!ds) return res.status(404).json({ error: "Dataset not found" });
    if (String(ds.owner) !== String(req.userId)) {
      return res.status(403).json({ error: "Not your dataset" });
    }

    // Borrar archivos en Cassandra
    const datasetUUID = cassTypes.Uuid.fromString(objectIdToUuid(datasetId));
    const assetUuid = cassTypes.TimeUuid.fromString(assetId);

    await cassandraClient.execute(
      "DELETE FROM files WHERE dataset_id = ? AND id = ?",
      [datasetUUID, assetUuid],
      { prepare: true }
    );

    // Cambiar estado del dataset y modificar fecha y hora de cambio
    await Dataset.updateOne(
      { _id: datasetId },
      { $set: { status: "pending" } }
    );

    return res.status(204).end();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
// Borrar archivos y videos
app.delete(
  "/api/datasets/:id/assets/:assetId",
  verifyToken,
  deleteAssetHandler
);
app.delete("/datasets/:id/assets/:assetId", verifyToken, deleteAssetHandler);
// Clonar dataset
app.post("/api/datasets/:id/clone", verifyToken, async (req, res) => {
  const { id } = req.params;

  async function findDatasetByAnyId(id) {
    let ds = await Dataset.findOne({ datasetId: id }).populate({
      path: "owner",
      select: "_id",
    });
    if (!ds && mongoose.isValidObjectId(id)) {
      ds = await Dataset.findById(id).populate({
        path: "owner",
        select: "_id",
      });
    }
    return ds;
  }

  const sessionNeo = driver.session();
  let newDsSaved = null;

  try {
    // 1) Load source dataset
    const src = await findDatasetByAnyId(id);
    if (!src) return res.status(404).json({ error: "dataset not found" });

    // 2) Ownership check
    if (String(src.owner?._id || src.owner) !== String(req.userId)) {
      return res.status(403).json({ error: "only the owner can clone" });
    }

    // 3) Create the new dataset in Mongo
    const now = new Date();
    const dst = new Dataset({
      owner: src.owner,
      name: (src.name || "Untitled") + " (copy)",
      description: src.description || "",
      datasetAvatarUrl: src.datasetAvatarUrl || null,
      status: "pending",
      ratingAvg: 0,
      ratingCount: 0,
      downloadsCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await dst.save();
    newDsSaved = dst;

    // 4) Neo4j node
    const neoParams = {
      id: dst._id.toString(),
      userId: (src.owner?._id || src.owner).toString(),
      name: dst.name,
      avatar: dst.datasetAvatarUrl || null,
      createdAt: dst.createdAt.toISOString(),
    };

    await sessionNeo.executeWrite((tx) =>
      tx.run(
        `
        MERGE (d:Dataset {ID: $id})
        ON CREATE SET
          d.UserID          = $userId,
          d.name            = $name,
          d.downloadsCount  = 0,
          d.ratingCount     = 0,
          d.ratingSum       = 0,
          d.ratingAvg       = 0.0,
          d.createdAt       = $createdAt
        `,
        neoParams
      )
    );

    // 5) Duplicate assets in Cassandra to match your table definition
    const srcUUID = cassTypes.Uuid.fromString(
      objectIdToUuid(src._id.toString())
    );
    const dstUUID = cassTypes.Uuid.fromString(
      objectIdToUuid(dst._id.toString())
    );

    // Only the columns that actually exist in `files`
    const qSelect =
      "SELECT id, kind, name, creation_date, amount_of_bytes, blob_data FROM files WHERE dataset_id = ?";

    const qInsert =
      "INSERT INTO files (dataset_id, id, kind, name, creation_date, amount_of_bytes, blob_data) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?)";

    const rows = await cassandraClient.execute(qSelect, [srcUUID], {
      prepare: true,
    });

    for (const r of rows.rows) {
      const newAssetId = cassTypes.TimeUuid.now(); // new TIMEUUID for the clone
      const createdAt = r.creation_date || new Date(); // keep original if present

      await cassandraClient.execute(
        qInsert,
        [
          dstUUID,
          newAssetId,
          r.kind,
          r.name,
          createdAt,
          r.amount_of_bytes,
          r.blob_data, // Buffer/BLOB as stored
        ],
        { prepare: true }
      );
    }

    // 6) Done
    return res.json({
      _id: dst._id,
      id: dst._id,
      datasetId: dst.datasetId || dst._id,
      name: dst.name,
      description: dst.description,
      datasetAvatarUrl: dst.datasetAvatarUrl || null,
      status: dst.status,
      owner: dst.owner,
      createdAt: dst.createdAt,
      updatedAt: dst.updatedAt,
    });
  } catch (err) {
    if (newDsSaved) {
      try {
        await Dataset.deleteOne({ _id: newDsSaved._id });
      } catch {}
      try {
        await sessionNeo.executeWrite((tx) =>
          tx.run("MATCH (d:Dataset {ID:$id}) DETACH DELETE d", {
            id: String(newDsSaved._id),
          })
        );
      } catch {}
    }
    return res.status(500).json({ error: err.message });
  } finally {
    await sessionNeo.close();
  }
});

// publicar un comentario
app.post("/posts/:postId/comments", async (req, res) => {
  try {
    const comentario = await postComment(req, res); // tu función ya existente devuelve el comentario creado

    // Aquí agregamos la notificación si el comentario no es del dueño del post
    const postOwnerId = "usuarioPropietarioDelPost"; // Estoy hay que ver de donde se saca
    if (comentario.idAutor !== postOwnerId) {
      await addNotification(
        postOwnerId,
        "comentario",
        req.params.postId,
        `${comentario.idAutor} comentó en tu post`
      );
    }

    res.status(201).json(comentario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// borrar un comentario
app.delete("/posts/:postId/comments/:commentId", deleteComment);
// obtener los comentarios
app.get("/posts/:postId/comments", getComments);
// editar un comentario
//app.patch("/:postId/:commentId", editComment); // Editar comentario

/* Crear un nuevo chat entre dos usuarios

Uso
POST /chats/create
{
  "userA": "u123",
  "userB": "u456"
}*/
app.post("/chats/create", createChat);

/* Enviar mensaje a un chat
Uso
POST /chats/abc123/messages
{
"userId": "u123",
  "mensaje": "Hola!"
} */
app.post("/chats/:chatId/messages", async (req, res) => {
  const mensaje = await sendMessage(req, res);

  const chatParticipants = await getChatParticipants(req.params.chatId);
  for (const u of chatParticipants) {
    if (u !== mensaje.idAutor) {
      await addNotification(
        u,
        "mensaje",
        req.params.chatId,
        `Nuevo mensaje de ${mensaje.idAutor}`
      );
    }
  }

  res.status(201).json(mensaje);
});

/* Obtener mensajes de un chat
Uso
GET /chats/abc123/messages */
app.get("/chats/:chatId/messages", getMessages);

/* Obtener todos los chats de un usuario
//Uso
//GET /users/u123/chats */
app.get("/users/:userId/chats", getUserChats);

/* 
  Se suele usar este flujo
  - Cuando se crea un nuevo chat se invoca a create, esto solo se hace una vez
  - Luego para enviar un mensaje se ocupa el chat id
  - El chatId esta en redis con el key del id del usuario, llamando a /chats se pueden obtener todos los id
  - Luego cuando se entra a un chat, se usa el chatId y se llama a /messages para jalar todos los mensajes
*/

app.use(updateRouter);
app.use(datasetApproved);
app.use(getFollowers);
app.use(getFollowing);
app.use(getUserProfile);
app.use("/admin", adminRoutes);
app.use("/admin", manageDatasets);
app.use(startFollowing);
app.use(badgesRouter);
// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await driver.close();
  process.exit(0);
});
