// import mongoose from "mongoose";

// const budgetSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   budgets: [
//     {
//       category: { type: String, required: true },
//       spending: { type: Number, required: true },
//       recommendation: { type: String, required: true },
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// export default mongoose.models.Budget || mongoose.model("Budget", budgetSchema);

import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UploadLogs",
    required: true,
    unique: true, // Ensure one budget per file
  },
  budgets: [
    {
      category: {
        type: String,
        required: true,
      },
      spending: {
        type: Number,
        required: true,
        min: 0,
      },
      recommendation: {
        type: String,
        required: true,
      },
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  totalSpending: {
    type: Number,
    required: true,
    min: 0,
  },
});

export default mongoose.models.Budget || mongoose.model("Budget", budgetSchema);
