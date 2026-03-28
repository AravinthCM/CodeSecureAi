import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
import TestCase from "../models/TestCase.js"; // add this import at the top

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generatePayloads = async (req, res) => {
  try {
    console.log("🔍 Gemini AI - generatePayloads called");

    const { url, apiName, apiDescription, apiId } = req.body; // 👈 added apiId

    if (!apiDescription) {
      return res.status(400).json({ message: "API description is required" });
    }

    if (!apiId) {
      return res.status(400).json({ message: "apiId is required" });
    }

    const prompt = `
You are a senior QA automation engineer.

Analyze the following API:

API NAME:
${apiName}

API URL:
${url}

FULL BACKEND LOGIC:
${apiDescription}

TASK:

1. Carefully extract all schema fields.
2. Detect required fields, data types, enums, min/max, unique, validation rules.
3. Inspect controller logic for:
   - conditional validations
   - authorization checks
   - business logic
   - error handling
4. Generate exactly 10 test cases in a JSON array.

Structure for EACH test case:

{
  "type": "Happy | Edge | Malicious",
  "title": "Short description",
  "description": "What is being tested",
  "payload": { actual request body JSON },
  "expectedStatus": 200,
  "expectedResult": "Short expected behavior"
}

Rules:
- 3 Happy Path
- 3 Edge
- 4 Malicious
- Return ONLY valid JSON array
- No markdown
- No comments
- No explanation
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const text = response.text;

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in AI response");

    let cleanedText = jsonMatch[0]
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(
        /"[^"]*"\.repeat\((\d+)\)/g,
        (_, n) => `"${"a".repeat(Number(n))}"`,
      )
      .replace(/[\x00-\x1F\x7F]/g, " ")
      .replace(/,(\s*[}\]])/g, "$1")
      .trim();

    let payloads;
    try {
      payloads = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("❌ Raw AI response:\n", text);
      return res.status(500).json({
        message: "AI returned malformed JSON",
        error: parseError.message,
        raw: text.slice(0, 500),
      });
    }

    if (!Array.isArray(payloads)) {
      return res
        .status(500)
        .json({ message: "AI did not return a valid array", raw: text });
    }

    console.log(`✅ Generated ${payloads.length} test cases`);

    // 👇 Everything below is new

    // Delete old test cases for this API before saving new ones
    await TestCase.deleteMany({ apiId });

    // Map each AI payload into a TestCase document
    const testCaseDocs = payloads.map((p) => ({
      apiId,
      payload: p,
      snapshot: {
        expectedStatus: p.expectedStatus,
        expectedResult: p.expectedResult,
      }, // 👈 set from AI data immediately, not from first run
      lastRun: {
        statusCode: null,
        actualResponse: null,
        passed: null,
        timestamp: null,
      },
    }));

    const saved = await TestCase.insertMany(testCaseDocs);

    return res.json({ success: true, payloads: saved });
  } catch (error) {
    console.error("❌ Gemini Generation Error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// ─── General Text Generation ──────────────────────────────────────────────────
export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return res.json({ success: true, response: response.text });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Error generating content", error: error.message });
  }
};

// ─── Test Gemini Connection ───────────────────────────────────────────────────
export const testGemini = async (req, res) => {
  try {
    console.log("🧪 Gemini test endpoint called");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: "Say hello and confirm the API is working.",
    });

    console.log("✅ Gemini response:", response.text);

    return res.json({
      success: true,
      message: "Gemini API is working ✅",
      geminiResponse: response.text,
    });
  } catch (error) {
    console.error("❌ Gemini Test Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gemini API failed",
      error: error.message,
    });
  }
};
