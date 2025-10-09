import { Router } from "express";
import Dataset from "../models/Dataset.js";
import { verifyToken } from "./auth.routes.js";
import { notifyFollowersOfApproval } from "../routes/notifyFollowers.js";

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

router.put("/admin/datasets/:id/approve", verifyToken, async (req, res) => {
  try {
    const ds = await Dataset.findById(req.params.id);
    if (!ds) return res.status(404).json({ error: "Dataset not found" });

    const was = ds.status;
    ds.status = "approved";
    await ds.save();

    if (was !== "approved") {
      await notifyFollowersOfApproval({ ownerMongoId: ds.owner, dataset: ds });
    }

    res.json({ msg: "Approved", datasetId: ds._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
