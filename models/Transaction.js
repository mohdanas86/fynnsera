import mongoose from "mongoose";

// const TransactionSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   accessToken: { type: String },
//   transactionId: { type: String, required: true, unique: true },
//   accountId: { type: String, required: true },
//   amount: { type: Number, required: true },
//   date: { type: Date, required: true },
//   description: { type: String },
//   category: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });
const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider: { type: String, required: true },
  filename: { type: String, required: true },
  currentBalance: { type: Number },
  transactions: { type: Array, required: true }, // store full array
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
