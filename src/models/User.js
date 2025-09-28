//esquema de usuario en mongo

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  birthDate: { type: Date, required: true },
  avatarUrl: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);
export default User;
