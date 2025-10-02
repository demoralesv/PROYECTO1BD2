import { Router } from "express";
import User from "../models/User.js";
import Dataset from "../models/Dataset.js";
import { verifyToken } from "./auth.routes.js";

const router = Router();

// helpers
function normalizeLimitPage(req) {
  const limit = Math.min(
    Math.max(parseInt(req.query.limit || "20", 10), 1),
    50
  );
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
}

// Basic text search (uses text index if available; falls back to regex)
async function searchUsers(q, { limit, skip }) {
  if (!q) {
    return await User.find({})
      .select("fullName username avatarUrl bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  const textQuery = { $text: { $search: q } };
  const regexQuery = {
    $or: [
      { fullName: { $regex: q, $options: "i" } },
      { username: { $regex: q, $options: "i" } },
      { bio: { $regex: q, $options: "i" } },
    ],
  };

  try {
    return await User.find(textQuery, { score: { $meta: "textScore" } })
      .select("fullName username avatarUrl bio")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .lean();
  } catch {
    return await User.find(regexQuery)
      .select("fullName username avatarUrl bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}

async function searchDatasets(q, { limit, skip }) {
  const baseSel =
    "name downloads datasetId owner ownerUsername status updatedAt";

  if (!q) {
    return await Dataset.find({ status: "approved" })
      .select(baseSel)
      .populate("owner", "username")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  const textQuery = {
    $and: [{ status: "approved" }, { $text: { $search: q } }],
  };
  const regexQuery = {
    $and: [
      { status: "approved" },
      {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { tags: { $regex: q, $options: "i" } },
          { ownerUsername: { $regex: q, $options: "i" } },
        ],
      },
    ],
  };

  try {
    return await Dataset.find(textQuery, { score: { $meta: "textScore" } })
      .select(baseSel)
      .populate("owner", "username")
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .lean();
  } catch {
    return await Dataset.find(regexQuery)
      .select(baseSel)
      .populate("owner", "username")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}

// Routes (use the same auth middleware name you already use elsewhere)
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
