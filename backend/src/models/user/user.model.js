import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      // Required for email provider; optional for google provider.
      // Enforced at controller/service level.
    },

    googleId: { type: String, unique: true, sparse: true, trim: true },

    authProvider: {
      type: String,
      enum: ["email", "google"],
      required: true,
    },

    avatar: { type: String },

    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },

    isVerified: { type: Boolean, default: false },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);


export default mongoose.model("User", userSchema);
