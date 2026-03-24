import mongoose from "mongoose";

const apiSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE"],
    },
    apiName: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Api = mongoose.model("Api", apiSchema);
export default Api; // ✅ default export
