import mongoose from "mongoose";

const FormattedTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "UploadLog",
  },
  formattedData: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const FormattedTransactionModel =
  mongoose.models.FormattedTransaction ||
  mongoose.model("FormattedTransaction", FormattedTransactionSchema);

export default FormattedTransactionModel;
