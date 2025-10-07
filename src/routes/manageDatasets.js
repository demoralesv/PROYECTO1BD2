import { Router } from "express";
import Dataset from "../models/Dataset.js";
import { requireAuth, requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

async function listDatasets(req, res) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const datasets = await Dataset.find(
      filter,
      "name status owner createdAt datasetId description datasetAvatarUrl"
    )
      .populate("owner", "username role")
      .sort({ createdAt: -1 });

    res.json(datasets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


async function approveDataset(req, res) {
  try {
    const { id } = req.params;
    const ds = await Dataset.findById(id).populate("owner", "username role");
    if (!ds) return res.status(404).json({ error: "Dataset not found" });

    if (ds.status === "approved")
      return res.status(400).json({ error: "The dataset is already approved" });

    if (!["pending", "submitted", "declined"].includes(ds.status))
      return res.status(400).json({ error: `Can not approved from status: ${ds.status}` });

    ds.status = "approved";
    await ds.save();

    res.json({ msg: "Dataset approved ✅", dataset: ds });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


async function declineDataset(req, res) {
  try {
    const { id } = req.params;
    const ds = await Dataset.findById(id).populate("owner", "username role");
    if (!ds) return res.status(404).json({ error: "Dataset not found" });

    if (ds.status === "declined")
      return res.status(400).json({ error: "The dataset is already declined" });

    if (!["pending", "submitted", "approved"].includes(ds.status))
      return res.status(400).json({ error: `Can not decline from status: ${ds.status}` });

    ds.status = "declined";
    await ds.save();

    res.json({ msg: "Dataset declined ✖️", dataset: ds });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

router.get("/datasets/all", requireAuth, requireAdmin, listDatasets);
router.put("/datasets/:id/approve", requireAuth, requireAdmin, approveDataset);
router.put("/datasets/:id/decline", requireAuth, requireAdmin, declineDataset);

export default router;
