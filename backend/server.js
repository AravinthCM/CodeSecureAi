import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/apiAction.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/apis", apiRoutes);
app.use("/api/ai", aiRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error ❌", err));

app.get("/test", (req, res) => {
  res.json("hi luffy");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
