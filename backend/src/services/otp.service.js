import { ensureRedis } from "../config/redis.js";
import {
  clearOtpInMongo,
  storeOtpInMongo,
  verifyOtpInMongo,
} from "./otpFallback.service.js";

const OTP_EXPIRY = 300; // 5 min
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN = 60; // 1 min
let hasLoggedMongoFallback = false;

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getRedisIfAvailable = async () => {
  try {
    return await ensureRedis();
  } catch (error) {
    if (!hasLoggedMongoFallback) {
      hasLoggedMongoFallback = true;
      console.warn("Redis unavailable, falling back to MongoDB for OTP storage");
    }

    return null;
  }
};

export const storeOTP = async (identifier, type, otp) => {
  const redis = await getRedisIfAvailable();

  if (!redis) {
    await storeOtpInMongo({
      identifier,
      type,
      otp,
      otpExpirySeconds: OTP_EXPIRY,
      resendCooldownSeconds: RESEND_COOLDOWN,
    });
    return;
  }

  const otpKey = `otp:${type}:${identifier}`;
  const cooldownKey = `otp_cooldown:${type}:${identifier}`;

  // 🚫 prevent spam
  const cooldown = await redis.get(cooldownKey);
  if (cooldown) {
    throw new Error("Please wait before requesting OTP again");
  }

  await redis.set(otpKey, otp, "EX", OTP_EXPIRY);
  await redis.set(cooldownKey, "1", "EX", RESEND_COOLDOWN);
};

export const verifyOTP = async (identifier, type, otp) => {
  const redis = await getRedisIfAvailable();

  if (!redis) {
    return verifyOtpInMongo({
      identifier,
      type,
      otp,
      maxAttempts: MAX_ATTEMPTS,
    });
  }

  const otpKey = `otp:${type}:${identifier}`;
  const attemptKey = `otp_attempt:${type}:${identifier}`;

  const stored = await redis.get(otpKey);

  if (!stored) return false;

  const attempts = Number(await redis.get(attemptKey)) || 0;

  if (attempts >= MAX_ATTEMPTS) {
    throw new Error("Too many attempts. Try again later.");
  }

  if (stored !== otp) {
    await redis.set(attemptKey, attempts + 1, "EX", OTP_EXPIRY);
    return false;
  }

  // success
  await redis.del(otpKey);
  await redis.del(attemptKey);

  return true;
};

export const clearOTP = async (identifier, type) => {
  const redis = await getRedisIfAvailable();

  if (redis) {
    const otpKey = `otp:${type}:${identifier}`;
    const cooldownKey = `otp_cooldown:${type}:${identifier}`;
    const attemptKey = `otp_attempt:${type}:${identifier}`;

    await redis.del(otpKey, cooldownKey, attemptKey);
  }

  await clearOtpInMongo({ identifier, type });
};
