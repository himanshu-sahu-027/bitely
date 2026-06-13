import mongoose from "mongoose";

// Stores OTP state in MongoDB when Redis is unavailable.
const otpFallbackSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, trim: true, index: true },

    // Email-only fallback storage (phone/Twilio disabled)
    type: {
      type: String,
      required: true,
      enum: ["email"],
      index: true,
    },

    otp: { type: String, required: true },
    expires_at: { type: Date, required: true },
    cooldown_until: { type: Date, required: true },
    attempt_count: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

otpFallbackSchema.index({ identifier: 1, type: 1 }, { unique: true });
otpFallbackSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const OtpFallback =
  mongoose.models.OtpFallback ||
  mongoose.model("OtpFallback", otpFallbackSchema);

export default OtpFallback;
