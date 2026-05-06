import OtpFallback from "../models/user/otpFallback.model.js";

export const storeOtpInMongo = async ({
  identifier,
  type,
  otp,
  otpExpirySeconds,
  resendCooldownSeconds,
}) => {
  const now = new Date();
  const existingOtp = await OtpFallback.findOne({ identifier, type });

  if (existingOtp && existingOtp.cooldown_until > now) {
    throw new Error("Please wait before requesting OTP again");
  }

  await OtpFallback.findOneAndUpdate(
    { identifier, type },
    {
      $set: {
        otp,
        expires_at: new Date(now.getTime() + otpExpirySeconds * 1000),
        cooldown_until: new Date(now.getTime() + resendCooldownSeconds * 1000),
        attempt_count: 0,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );
};

export const verifyOtpInMongo = async ({
  identifier,
  type,
  otp,
  maxAttempts,
}) => {
  const otpRecord = await OtpFallback.findOne({ identifier, type });

  if (!otpRecord) return false;

  if (otpRecord.expires_at <= new Date()) {
    await otpRecord.deleteOne();
    return false;
  }

  if (otpRecord.attempt_count >= maxAttempts) {
    throw new Error("Too many attempts. Try again later.");
  }

  if (otpRecord.otp !== otp) {
    otpRecord.attempt_count += 1;
    await otpRecord.save();
    return false;
  }

  await otpRecord.deleteOne();
  return true;
};

export const clearOtpInMongo = async ({ identifier, type }) => {
  await OtpFallback.deleteOne({ identifier, type });
};
