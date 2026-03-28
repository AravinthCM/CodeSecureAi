// controllers/dashboardController.js
import Api from "../models/Api.js";
import TestCase from "../models/TestCase.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id; // from your auth middleware

    // All APIs belonging to this user
    const apis = await Api.find({ userId });
    const apiIds = apis.map((a) => a._id);

    // Aggregate test case stats across all APIs
    const testCaseStats = await TestCase.aggregate([
      { $match: { apiId: { $in: apiIds } } },
      {
        $group: {
          _id: "$apiId",
          total: { $sum: 1 },
          passed: {
            $sum: { $cond: [{ $eq: ["$lastRun.passed", true] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$lastRun.passed", false] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$lastRun.passed", null] }, 1, 0] },
          },
          lastRun: { $max: "$lastRun.timestamp" },
        },
      },
    ]);

    // Map stats back to API names
    const statsMap = {};
    testCaseStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const perApi = apis.map((api) => {
      const s = statsMap[api._id.toString()] || {
        total: 0,
        passed: 0,
        failed: 0,
        pending: 0,
        lastRun: null,
      };
      return {
        _id: api._id,
        apiName: api.apiName,
        method: api.method,
        total: s.total,
        passed: s.passed,
        failed: s.failed,
        pending: s.pending,
        passRate: s.total > 0 ? Math.round((s.passed / s.total) * 100) : null,
        lastRun: s.lastRun,
      };
    });

    // Overall totals
    const totalApis = apis.length;
    const totalCases = perApi.reduce((sum, a) => sum + a.total, 0);
    const totalPassed = perApi.reduce((sum, a) => sum + a.passed, 0);
    const totalFailed = perApi.reduce((sum, a) => sum + a.failed, 0);
    const totalPending = perApi.reduce((sum, a) => sum + a.pending, 0);
    const overallPassRate =
      totalCases > 0 ? Math.round((totalPassed / totalCases) * 100) : null;

    return res.json({
      totalApis,
      totalCases,
      totalPassed,
      totalFailed,
      totalPending,
      overallPassRate,
      perApi,
    });
  } catch (error) {
    console.error("❌ getDashboardStats error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
