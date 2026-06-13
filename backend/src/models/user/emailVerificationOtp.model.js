import mongoose from "mongoose";

const emailVerificationOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    cooldownUntil: { type: Date, required: true },
    attemptCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Expire documents automatically when expired
emailVerificationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.EmailVerificationOtp ||
  mongoose.model("EmailVerificationOtp", emailVerificationOtpSchema);
