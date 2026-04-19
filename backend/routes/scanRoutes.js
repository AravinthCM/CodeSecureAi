import express from "express";
import { scanRepo } from "../controllers/scanController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();
router.post("/", auth, scanRepo);
export default router;
