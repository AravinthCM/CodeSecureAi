// models/RunHistory.js
import mongoose from "mongoose";

const runHistorySchema = new mongoose.Schema(
  {
    apiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Api",
      required: true,
    },
    apiName: { type: String, required: true }, // denormalized
    runType: { type: String, enum: ["all", "single"], required: true },
    runAt: { type: Date, default: Date.now },
    totalCases: { type: Number, required: true },
    passed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    results: [
      {
        testCaseId: { type: mongoose.Schema.Types.ObjectId },
        title: { type: String },
        statusCode: { type: Number },
        passed: { type: Boolean },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("RunHistory", runHistorySchema);
