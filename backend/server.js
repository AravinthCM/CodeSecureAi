import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/apiAction.js";
import aiRoutes from "./routes/aiRoutes.js";
import testCaseRoutes from "./routes/testCaseRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import runHistoryRoutes from "./routes/runHistoryRoutes.js";
import scanRoutes from "./routes/scanRoutes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://code-secure-ai.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ✅ Fix: use /{*path} instead of *
app.options("/{*path}", cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/apis", apiRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/test-cases", testCaseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/run-history", runHistoryRoutes);
app.use("/api/scan", scanRoutes);

if (!process.env.MONGO_URI) {
  console.log("Skipping DB connection in CI");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(console.error);
}

app.get("/test", (req, res) => {
  res.json("hi luffy");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
