import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  scans: { type: Array, default: [] },
  magicToken: { type: String, required: false },
  magicTokenExpires: { type: Date, required: false }
});

const User = mongoose.model("User", userSchema);
export default User;
