// // models/CachedTip.js
// import mongoose from "mongoose";
// import { unique } from "next/dist/build/utils";

// const CachedTipSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       unique: false,
//       // ref: "User", // Add reference if you have User model
//     },
//     fileId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//       unique: true,
//       // ref: "UploadLog",
//     },
//     aiTips: {
//       type: String,
//       required: true,
//       set: function (tips) {
//         return JSON.stringify(tips); // Automatically stringify when saving
//       },
//       get: function (tips) {
//         return JSON.parse(tips); // Automatically parse when retrieving
//       },
//     },
//     lastUpdated: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     toJSON: { getters: true }, // Ensure getters are applied when converting to JSON
//   }
// );

// // Compound index - allows multiple records per user but unique per user+file combination
// // CachedTipSchema.index({ userId: 1, fileId: 5 }, { unique: true });

// export default mongoose.models.CachedTip ||
//   mongoose.model("CachedTip", CachedTipSchema);

// models/CachedTip.js
import mongoose from "mongoose";

const CachedTipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // ref: "User", // Uncomment if using User model
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // ref: "UploadLog", // Uncomment if using UploadLog model
    },
    aiTips: {
      type: String,
      required: true,
      set: function (tips) {
        return JSON.stringify(tips); // Automatically stringify when saving
      },
      get: function (tips) {
        return JSON.parse(tips); // Automatically parse when retrieving
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { getters: true },
  }
);

// ✅ Ensure one CachedTip per user+file combination
CachedTipSchema.index({ userId: 1, fileId: 1 }, { unique: true });

export default mongoose.models.CachedTip ||
  mongoose.model("CachedTip", CachedTipSchema);
