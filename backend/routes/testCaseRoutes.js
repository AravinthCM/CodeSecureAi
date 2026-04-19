// routes/testCaseRoutes.js
import express from "express";
import {
  getTestCases,
  updateTestCaseResult,
  deleteTestCase,
  updateTestCaseNotes,
} from "../controllers/testCaseController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/:apiId", auth, getTestCases);
router.patch("/:id/result", auth, updateTestCaseResult);
router.delete("/:id", auth, deleteTestCase);
router.patch("/:id/notes", auth, updateTestCaseNotes);

export default router;
