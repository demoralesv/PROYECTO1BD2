// server.js
import express, { json } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
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
import searchPage from "./web/pages/Search/search.js";
import getFollowers from "./src/routes/getFollowers.js";
import getFollowing from "./src/routes/getFollowing.js";
import profilePublic from "./web/pages/profile/profilePublic.js";
import getUserProfile from "./src/routes/getUserProfile.js";
import searchRouter from "./src/routes/search.js";

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

//Chats
import createChat from "./src/routes/chatCreate.js";
import sendMessage from "./src/routes/chatSendMessage.js";
import getMessages from "./src/routes/chatGetMessages.js";
import getUserChats from "./src/routes/chatGetUserChats.js";

//servicio de notificaciones
import { addNotification } from "./src/routes/addNotification.js"; 
import { getNotifications } from "./src/routes/getNotification.js";
import { markAsRead } from "./src/routes/markReadNotification.js";


dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.static("pages"));
// Middleware to parse JSON
app.use(express.json());
app.use(searchRouter);

connectDB();
await initCassandra();
await initNeo4j();
//Redis se conecta solo al iniciar el proyecto
// rutas, definen que hace cuando se le agrega /algo a la url
// Home = login

await User.syncIndexes();
await Dataset.syncIndexes();
console.log("✅ Indexes synced");

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

//ver seguidores
app.get("/followers", (req, res) => {
  res.send(followers());
});
//ver siguiendo
app.get("/following", (req, res) => {
  res.send(following());
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

// Crear dataset
app.post("/datasets", verifyToken, async (req, res) => {
  try {
    const { datasetId, name, description, datasetAvatarUrl } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "Name and description are required" });
    }

    const ds = new Dataset({
      owner: req.userId,
      datasetId,
      name,
      description,
      datasetAvatarUrl: datasetAvatarUrl || null,
    });

    await ds.save();

    return res.json({
      _id: ds._id,
      datasetId: ds.datasetId,
      name: ds.name,
      description: ds.description,
      datasetAvatarUrl: ds.datasetAvatarUrl,
      status: ds.status,
      owner: ds.owner,
      createdAt: ds.createdAt,
      updatedAt: ds.updatedAt,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "datasetId already exists" });
    }
    res.status(500).json({ error: err.message });
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
//Borrar dataset
app.delete("/api/datasets/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    let ds = await Dataset.findOne({ datasetId: id });
    if (!ds && mongoose.isValidObjectId(id)) {
      ds = await Dataset.findById(id);
    }
    if (!ds) return res.status(404).json({ error: "Dataset not found" });

    // Lo puede borrar un admin o el usuario que lo creó
    const isOwner = String(ds.owner) === String(req.userId);
    const isAdmin = req.userRole === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await ds.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
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
// Obtener los datasets (míos o de otro usuario por username)
app.get("/datasets", verifyToken, async (req, res) => {
  try {
    const { mine, owner, status } = req.query;
    const filter = {};

    if (String(mine).toLowerCase() === "true") {
      filter.owner = req.userId;
    }
    if (owner) {
      const u = await User.findOne({ username: owner }, { _id: 1 }).lean();
      if (!u) return res.json({ items: [], total: 0 });
      filter.owner = u._id;
    }
    if (status) filter.status = status;

    const items = await Dataset.find(filter).sort({ createdAt: -1 }).lean();
    const total = await Dataset.countDocuments(filter);

    res.json({
      items: items.map((d) => ({
        id: d._id,
        datasetId: d.datasetId,
        name: d.name,
        description: d.description,
        status: d.status,
        votes: d.votes ?? 0,
        updatedAt: d.updatedAt,
      })),
      total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    res.json({
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
      files: [], // Ahorita no hay
      videos: [], // Ahorita no hay
      createdAt: ds.createdAt,
      updatedAt: ds.updatedAt,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Votos en un dataset
app.post("/api/datasets/:id/votes", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ error: "value must be an integer 1..5" });
    }

    let ds = await Dataset.findOne({ datasetId: id }).lean();
    if (!ds && mongoose.isValidObjectId(id)) ds = await Dataset.findById(id).lean();
    if (ds && String(ds.owner) === String(req.userId)) {
      return res.status(403).json({ error: "Owners cannot vote their own dataset" });
    }

    // Por ahora
    console.log("Vote (stub):", { datasetId: id, user: req.userId, value });

    // Por ahora funciona esto. Ver con Neo4j después
    return res.json({ ratingAvg: value, ratingCount: 1 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
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
app.patch("/:postId/:commentId", editComment); // Editar comentario



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
      await addNotification(u, "mensaje", req.params.chatId, `Nuevo mensaje de ${mensaje.idAutor}`);
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
// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await driver.close();
  process.exit(0);
});
