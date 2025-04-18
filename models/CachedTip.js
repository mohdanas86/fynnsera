// models/CachedTip.js
import mongoose from "mongoose";

const CachedTipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  aiTips: { type: String, required: true },
  transactionsHash: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.models.CachedTip ||
  mongoose.model("CachedTip", CachedTipSchema);
