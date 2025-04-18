import mongoose from "mongoose";

const UploadLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: String, required: true },
  filename: { type: String, required: true },
  currentBalance: { type: Number },
  transactions: { type: Array, required: true }, // store full array
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UploadLog ||
  mongoose.model("UploadLog", UploadLogSchema);
