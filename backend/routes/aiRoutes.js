// routes/gemini.routes.js
import express from "express";
import {
  generatePayloads,
  generateContent,
  testGemini,
} from "../controllers/geminiController.js";

const router = express.Router();

// Generate test payloads endpoint
router.post("/generate-payloads", generatePayloads);

// General text generation endpoint
router.post("/generate", generateContent);

router.get("/test-gemini", testGemini);

export default router;
