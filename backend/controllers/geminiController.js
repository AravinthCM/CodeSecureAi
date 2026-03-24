// controllers/gemini.controller.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate test payloads
// backend/controllers/geminiController.js
export const generatePayloads = async (req, res) => {
  try {
    console.log("API CALLED");

    const { url, apiName, apiDescription } = req.body;

    if (!apiDescription) {
      return res.status(400).json({
        message: "API description is required",
      });
    }

    console.log(req.body);

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

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error("No JSON array found in AI response");
    }

    const cleanedText = jsonMatch[0];

    const payloads = JSON.parse(cleanedText);

    if (!Array.isArray(payloads) || payloads.length !== 10) {
      return res.status(500).json({
        message: "AI did not generate exactly 10 test cases",
        raw: payloads,
      });
    }

    return res.json({
      success: true,
      payloads,
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// General text generation
export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      response: text,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error generating content",
      error: error.message,
    });
  }
};

export const testGemini = async (req, res) => {
  try {
    console.log("Gemini test endpoint called");

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const result = await model.generateContent(
      "Say hello and confirm the API is working.",
    );

    const text = result.response.text();

    console.log("Gemini response:", text);

    return res.json({
      success: true,
      message: "Gemini API is working",
      geminiResponse: text,
    });
  } catch (error) {
    console.error("Gemini Test Error:", error);

    return res.status(500).json({
      success: false,
      message: "Gemini API failed",
      error: error.message,
    });
  }
};
