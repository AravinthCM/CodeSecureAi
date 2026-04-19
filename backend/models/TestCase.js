// models/TestCase.js
import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    apiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Api",
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    lastRun: {
      statusCode: { type: Number, default: null },
      actualResponse: { type: mongoose.Schema.Types.Mixed, default: null },
      passed: { type: Boolean, default: null },
      timestamp: { type: Date, default: null },
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("TestCase", testCaseSchema);
