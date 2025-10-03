//esquema de dataset en mongo

import mongoose from "mongoose";

function initialsUrl(name = "Dataset") {
  const seed = encodeURIComponent((name || "Dataset").trim() || "Dataset");
  return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
}

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
    datasetAvatarUrl: {
      type: String,
      default: function () {
        return initialsUrl(this.name);
      },
    },

    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "declined"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

DatasetSchema.pre(
  "save",
  function (next) {
    if (!this.datasetId) {
      this.datasetId = new mongoose.Types.ObjectId().toString();
    }
    if (!this.datasetAvatarUrl) {
      this.datasetAvatarUrl = initialsUrl(this.name);
    }
    next();
  },
  { timestamps: true }
);

// Peso a las palabras
DatasetSchema.index(
  { name: "text", description: "text", ownerUsername: "text" },
  { weights: { name: 5, description: 2 }, default_language: "english" }
);

const Dataset = mongoose.model("Dataset", DatasetSchema);
export default Dataset;
