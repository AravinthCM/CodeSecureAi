// routes/runHistoryRoutes.js
import express from "express";
import {
  createRunHistory,
  getRunHistory,
} from "../controllers/runHistoryController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
router.post("/", auth, createRunHistory);
router.get("/:apiId", auth, getRunHistory);
export default router;
