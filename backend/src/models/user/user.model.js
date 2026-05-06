import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },

    phone: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },

    is_phone_verified: { type: Boolean, default: false },
    is_email_verified: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ["user", "vendor", "admin"],
      default: "user",
    },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);