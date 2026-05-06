import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  token: String,
  expires_at: Date,
}, { timestamps: true });

export default mongoose.model("AuthSession", sessionSchema);