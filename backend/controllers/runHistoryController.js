// controllers/runHistoryController.js
import RunHistory from "../models/RunHistory.js";

// POST /api/run-history
export const createRunHistory = async (req, res) => {
  try {
    const { apiId, apiName, runType, results } = req.body;

    const passed = results.filter((r) => r.passed === true).length;
    const failed = results.filter((r) => r.passed === false).length;
    const pending = results.filter((r) => r.passed === null).length;

    const record = await RunHistory.create({
      apiId,
      apiName,
      runType,
      totalCases: results.length,
      passed,
      failed,
      pending,
      results,
    });

    return res.json({ success: true, record });
  } catch (error) {
    console.error("❌ createRunHistory error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// GET /api/run-history/:apiId
export const getRunHistory = async (req, res) => {
  try {
    const records = await RunHistory.find({ apiId: req.params.apiId })
      .sort({ runAt: -1 }) // newest first
      .limit(50); // cap at 50 runs per API

    return res.json(records);
  } catch (error) {
    console.error("❌ getRunHistory error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
