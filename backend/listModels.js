import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  const models = await genAI.listModels();
  console.log("Available models:\n");

  models.forEach((m) => {
    console.log(`${m.name}  →  ${m.supportedGenerationMethods?.join(", ")}`);
  });
}

listModels().catch(console.error);
