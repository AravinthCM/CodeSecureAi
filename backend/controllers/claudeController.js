import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Generate Test Payloads ───────────────────────────────────────────────────
export const generatePayloads = async (req, res) => {
  try {
    console.log("🔍 Claude AI - generatePayloads called");

    const { url, apiName, apiDescription } = req.body;

    if (!apiDescription) {
      return res.status(400).json({
        message: "API description is required",
      });
    }

    const prompt = `
You are a senior QA automation engineer and security expert.

Analyze the following API:

API NAME:
${apiName}

API URL:
${url}

FULL BACKEND LOGIC:
${apiDescription}

TASK:
1. Carefully extract all schema fields.
2. Detect required fields, data types, enums, min/max, unique, and validation rules.
3. Inspect controller logic for:
   - conditional validations
   - authorization checks
   - business logic
   - error handling
4. Generate exactly 10 adversarial test cases in a JSON array.

Structure for EACH test case:
{
  "type": "Happy | Edge | Malicious",
  "title": "Short description",
  "description": "What is being tested and why it could be a vulnerability",
  "payload": { actual request body JSON },
  "expectedStatus": 400,
  "expectedResult": "Short expected secure behavior"
}

Rules:
- 3 Happy Path (valid inputs that should succeed)
- 3 Edge Cases (boundary conditions, empty strings, nulls, type mismatches)
- 4 Malicious (injection attacks, auth bypass, oversized inputs, XSS)
- Return ONLY a valid JSON array
- No markdown, no code fences, no comments, no explanation outside the JSON
`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001", // Cheapest & fastest model
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawText = message.content[0].text;

    // Extract JSON array from response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in Claude response");
    }

    const payloads = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(payloads)) {
      return res.status(500).json({
        message: "Claude did not return a valid array",
        raw: rawText,
      });
    }

    console.log(`✅ Generated ${payloads.length} test cases`);

    return res.json({
      success: true,
      payloads,
      usage: message.usage, // input_tokens + output_tokens for cost tracking
    });
  } catch (error) {
    console.error("❌ Claude Generation Error:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// ─── General Text Generation ──────────────────────────────────────────────────
export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    return res.json({
      success: true,
      response: message.content[0].text,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Error generating content",
      error: error.message,
    });
  }
};

// ─── Test Claude Connection ───────────────────────────────────────────────────
export const testClaude = async (req, res) => {
  try {
    console.log("🧪 Claude test endpoint called");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Say hello and confirm the Claude API is working.",
        },
      ],
    });

    const text = message.content[0].text;
    console.log("✅ Claude response:", text);

    return res.json({
      success: true,
      message: "Claude API is working ✅",
      claudeResponse: text,
      model: message.model,
    });
  } catch (error) {
    console.error("❌ Claude Test Error:", error);
    return res.status(500).json({
      success: false,
      message: "Claude API failed",
      error: error.message,
    });
  }
};
