import { Router } from "express";
import driver from "../databases/neo4j.js";
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
  const baseSel = "_id name status updatedAt owner";
  const filter = q
    ? {
        status: "approved",
        $or: [
          { name: { $regex: new RegExp(escapeRegExp(q), "i") } },
          { description: { $regex: new RegExp(escapeRegExp(q), "i") } },
          { ownerUsername: { $regex: new RegExp(escapeRegExp(q), "i") } },
        ],
      }
    : { status: "approved" };

  // Obtener info de MongoDB
  const mongoItems = await Dataset.find(filter)
    .select(baseSel)
    .populate("owner", "username")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Obtener info de Neo4j
  const ids = mongoItems.map((d) => String(d._id));
  const metricsById = new Map();

  if (ids.length) {
    const session = driver.session();
    try {
      const r = await session.executeRead((tx) =>
        tx.run(
          `UNWIND $ids AS id
           OPTIONAL MATCH (d:Dataset {ID:id})
           RETURN id,
                  coalesce(d.ratingAvg, 0.0) AS ratingAvg,
                  coalesce(d.ratingCount, 0)  AS ratingCount`,
          { ids }
        )
      );
      const toNum = (x) =>
        x && typeof x.toNumber === "function" ? x.toNumber() : x;
      r.records.forEach((rec) => {
        metricsById.set(rec.get("id"), {
          ratingAvg: Number(rec.get("ratingAvg") ?? 0),
          ratingCount: toNum(rec.get("ratingCount") ?? 0),
        });
      });
    } finally {
      await session.close();
    }
  }

  //Mezclar y obtener toda la info
  return mongoItems.map((d) => {
    const m = metricsById.get(String(d._id)) || {
      ratingAvg: 0,
      ratingCount: 0,
    };
    return {
      _id: String(d._id),
      datasetId: String(d._id),
      name: d.name,
      status: d.status,
      updatedAt: d.updatedAt,
      owner: d.owner ? { username: d.owner.username } : null,
      ratingAvg: m.ratingAvg,
      ratingCount: m.ratingCount,
    };
  });
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
  const items = await searchDatasets(q, { limit, skip });
  res.json({ items, limit });
});

export default router;
