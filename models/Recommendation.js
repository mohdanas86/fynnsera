import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recommendations: [
    {
      category: { type: String, required: true },
      spending: { type: Number, required: true },
      recommendation: { type: String, required: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Recommendation ||
  mongoose.model("Recommendation", RecommendationSchema);
