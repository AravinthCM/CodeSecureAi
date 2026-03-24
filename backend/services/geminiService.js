import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("genAI", genAI);
export async function runGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(clean);
  } catch (err) {
    console.error("Gemini error:", err);
    throw new Error("Failed to generate test cases from Gemini");
  }
}
