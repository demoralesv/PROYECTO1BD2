
import { Router } from "express";
import Dataset from "../models/Dataset.js";
import { verifyToken } from "./auth.routes.js";

const router = Router();

router.get("/datasetsApproved", verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
     
      filter.status = { $regex: new RegExp(`^${status}$`, "i") };
  
    }

    const items = await Dataset.find(filter).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
