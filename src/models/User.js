//esquema de usuario en mongo

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    birthDate: { type: Date, required: true },
    avatarUrl: { type: String, default: null },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// Peso a las palabras
userSchema.index(
  { username: "text", fullname: "text" },
  { weights: { username: 5, fullname: 3 }, default_language: "english" }
);

//List de chatsId
const User = mongoose.model("User", userSchema);
export default User;
