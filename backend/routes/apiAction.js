import express from "express";
import Api from "../models/Api.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { method, apiName } = req.body;
    if (!method || !apiName)
      return res.status(400).json({ message: "method and apiName required" });

    const api = await Api.create({
      method,
      apiName,
      user: req.user.id, // store the current user's id
    });

    res.status(201).json(api);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch APIs for current user only
router.get("/", auth, async (req, res) => {
  try {
    const apis = await Api.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(apis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid API ID" });
    }

    const api = await Api.findOne({ _id: id, createdBy: userId });

    if (!api) {
      return res.status(404).json({ message: "API not found" });
    }

    await api.deleteOne();

    res.status(200).json({
      message: "API deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Delete API error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
