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
import connectDB from "./src/databases/mongo.js";
import { verifyToken } from "./src/routes/auth.routes.js";
import { initCassandra, cassandraClient } from "./src/databases/cassandra.js";
import redisClient from "./src/databases/redis.js";
import connectNeo from "./src/databases/neo4j.js";
import updateRouter from "./src/routes/updateProfile.js";
import datasetApproved from "./src/routes/datasetsApproved.js";

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.static("pages"));
// Middleware to parse JSON
app.use(express.json());

connectDB();
await initCassandra();
connectNeo();
//Redis se conecta solo al iniciar el proyecto
// rutas, definen que hace cuando se le agrega /algo a la url
// Home = login
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
// Crear un dataset
app.get("/datasets/new", (req, res) => {
  res.send(createDataset());
});
// Info de un dataset
app.get("/datasets/:id", (req, res) => {
  res.send(datasetView());
});

app.get("/nombreDeFuncion", (req, res) => {
  res.send(nombreDeFuncion());
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
    ds.status = "pending"; // <— reset on edit

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

    res.json({
      username: user.username,
      fullName: user.fullname,
      dob: user.birthDate || null,
      avatarUrl: user.avatarUrl || null,
      stats: { files: 0, followers: 0, following: 0 }, // por ahora no están
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Obtener los datasets del usuario
app.get("/datasets", verifyToken, async (req, res) => {
  try {
    const { mine } = req.query;
    const filter = mine ? { owner: req.userId } : {};
    const items = await Dataset.find(filter).sort({ createdAt: -1 }).lean();

    const result = items.map((d) => ({
      id: d._id,
      datasetId: d.datasetId,
      name: d.name,
      description: d.description,
      status: d.status,
      votes: d.votes ?? 0,
      updatedAt: d.updatedAt,
    }));

    res.json({ items: result, total: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Obtener info de un dataset
app.get("/api/datasets/:id", verifyToken, async (req, res) => {
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

app.use(updateRouter);
app.use(datasetApproved);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
