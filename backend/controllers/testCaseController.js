// controllers/testCaseController.js
import TestCase from "../models/TestCase.js";

// GET /api/test-cases/:apiId
// Fetch all saved test cases for an API
export const getTestCases = async (req, res) => {
  try {
    const testCases = await TestCase.find({ apiId: req.params.apiId }).sort({
      createdAt: 1, // oldest first so order matches generation order
    });

    return res.json(testCases);
  } catch (error) {
    console.error("❌ getTestCases error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// PATCH /api/test-cases/:id/result
// Called after each test run — saves actual response, sets snapshot if first run
// controllers/testCaseController.js — updateTestCaseResult
export const updateTestCaseResult = async (req, res) => {
  try {
    const { statusCode, actualResponse, resetSnapshot } = req.body;

    const testCase = await TestCase.findById(req.params.id);
    if (!testCase)
      return res.status(404).json({ message: "Test case not found" });

    if (resetSnapshot) {
      testCase.snapshot = null;
      testCase.lastRun.passed = null;
      await testCase.save();
      return res.json({ success: true, testCase });
    }

    // passed = status matches AND response contains expected result
    const statusMatches = statusCode === testCase.snapshot?.expectedStatus;
    const responseStr = JSON.stringify(actualResponse).toLowerCase();
    const expectedStr = String(
      testCase.snapshot?.expectedResult || "",
    ).toLowerCase();
    const responseMatches = responseStr.includes(expectedStr);

    const passed = statusMatches && responseMatches;

    testCase.lastRun = {
      statusCode,
      actualResponse,
      passed,
      timestamp: new Date(),
    };

    await testCase.save();

    return res.json({ success: true, testCase }); // no more isFirstRun
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// DELETE /api/test-cases/:id
export const deleteTestCase = async (req, res) => {
  try {
    const testCase = await TestCase.findByIdAndDelete(req.params.id);

    if (!testCase) {
      return res.status(404).json({ message: "Test case not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ deleteTestCase error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
