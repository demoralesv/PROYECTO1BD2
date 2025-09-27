// server.js
import express, { json } from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./src/models/User.js";
import login from "./web/pages/login/login.js";
import signup from "./web/pages/signup/signup.js";
import profile from "./web/pages/profile/profile.js";
import connectDB from "./src/databases/mongo.js";
import { verifyToken } from "./src/routes/auth.routes.js";
import { initCassandra, cassandraClient } from "./src/databases/cassandra.js";

dotenv.config();

const app = express();
const PORT = 3000;
app.use(express.static("pages"));
// Middleware to parse JSON
app.use(express.json());

connectDB();
await initCassandra();

// rutas, definen que hace cuando se le agrega /algo a la url
// Home = login
app.get("/", (req, res) => {
  res.send(login());
});
// Signup
app.get("/signup", (req, res) => {
  res.send(signup());
});
// Perfil del usuario
app.get("/profile", (req, res) => {
  res.send(profile());
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
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
