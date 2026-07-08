import mongoose from "mongoose";

const pendingSignupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, required: true },

    // Used to guard against stale/duplicate attempts.
    expiresAt: { type: Date, required: true },

    // Optional: helps cleanup + debugging.
    createdBy: { type: String, enum: ["email"], default: "email" },
  },
  { timestamps: true }
);

// Auto-expire pending signup records
pendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PendingSignup ||
  mongoose.model("PendingSignup", pendingSignupSchema);
