import { Router } from "express";
import User from "../models/User.js";
import Dataset from "../models/Dataset.js";
import { verifyToken } from "./auth.routes.js";

const router = Router();

// Ayudan a que se vea bonito
function normalizeLimitPage(req) {
  const limit = Math.min(
    Math.max(parseInt(req.query.limit || "20", 10), 1),
    50
  );
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Búsqueda de usuarios
async function searchUsers(q, { limit, skip }) {
  const projection = "fullName fullname username avatarUrl";
  if (!q) {
    return await User.find({})
      .select(projection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  const regex = new RegExp(escapeRegExp(q), "i");

  // Consulta de $text. Es para buscar palabras relevantes
  let textResults = [];
  try {
    textResults = await User.find(
      { $text: { $search: q, $language: "english" } },
      { score: { $meta: "textScore" } }
    )
      .select(projection)
      .sort({ score: { $meta: "textScore" } })
      .skip(0)
      .limit(200)
      .lean();
  } catch (_) {}

  // regex fallback para buscar palabras parciales o prefijos
  const regexResults = await User.find({
    $or: [
      { fullName: { $regex: regex } },
      { fullname: { $regex: regex } },
      { username: { $regex: regex } },
    ],
  })
    .select(projection)
    .sort({ createdAt: -1 })
    .skip(0)
    .limit(200)
    .lean();

  // Obtener los resultados
  const seen = new Set();
  const merged = [];
  for (const r of [...textResults, ...regexResults]) {
    const id = String(r._id);
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(r);
    }
  }

  // Crear páginas de la búsqueda
  return merged.slice(skip, skip + limit);
}

// Búsqueda de datasets
async function searchDatasets(q, { limit, skip }) {
  const baseSel =
    "name description downloads datasetId owner ownerUsername status updatedAt";
  if (!q) {
    return await Dataset.find({ status: "approved" })
      .select(baseSel)
      .populate("owner", "username")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  const regex = new RegExp(escapeRegExp(q), "i");

  // Consulta de $text. Es para buscar palabras relevantes
  let textResults = [];
  try {
    textResults = await Dataset.find(
      { status: "approved", $text: { $search: q, $language: "english" } },
      { score: { $meta: "textScore" } }
    )
      .select(baseSel)
      .populate("owner", "username")
      .sort({ score: { $meta: "textScore" } })
      .limit(200)
      .lean();
  } catch (_) {}

  // 2) regex fallback para buscar palabras parciales o prefijos
  const regexResults = await Dataset.find({
    status: "approved",
    $or: [
      { name: { $regex: regex } },
      { description: { $regex: regex } },
      { ownerUsername: { $regex: regex } },
    ],
  })
    .select(baseSel)
    .populate("owner", "username")
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();

  // Obtener los resultados
  const seen = new Set();
  const merged = [];
  for (const r of [...textResults, ...regexResults]) {
    const id = String(r._id);
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(r);
    }
  }

  // Crear páginas de la búsqueda
  return merged.slice(skip, skip + limit);
}

// Rutas
router.get("/api/search/all", verifyToken, async (req, res) => {
  const { limit, skip } = normalizeLimitPage(req);
  const q = (req.query.q || "").trim();
  const [users, datasets] = await Promise.all([
    searchUsers(q, { limit, skip }),
    searchDatasets(q, { limit, skip }),
  ]);
  res.json({ users, datasets });
});

router.get("/api/search/users", verifyToken, async (req, res) => {
  const { limit, skip } = normalizeLimitPage(req);
  const q = (req.query.q || "").trim();
  const users = await searchUsers(q, { limit, skip });
  res.json({ items: users, limit });
});

router.get("/api/search/datasets", verifyToken, async (req, res) => {
  const { limit, skip } = normalizeLimitPage(req);
  const q = (req.query.q || "").trim();
  const ds = await searchDatasets(q, { limit, skip });
  res.json({ items: ds, limit });
});

export default router;
