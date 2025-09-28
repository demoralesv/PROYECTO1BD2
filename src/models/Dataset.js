//esquema de dataset en mongo

import mongoose from "mongoose";

const DatasetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    datasetId: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    datasetAvatarUrl: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "declined"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

DatasetSchema.pre("save", function (next) {
  if (!this.datasetId) {
    this.datasetId = new mongoose.Types.ObjectId().toString();
  }
  next();
});

const Dataset = mongoose.model("Dataset", DatasetSchema);
export default Dataset;
