import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { logoutUserSession } from "../services/auth.service.js";
import { generateOTP } from "../services/otp.service.js";
import { config } from "../config/env.js";
import { deliverEmailOtp } from "../services/deliverEmailOtp.service.js";
import { validateSendOtp } from "../utils/validateAuth.js";
import { createHttpError } from "../utils/createHttpError.js";
import { sendResponse } from "../utils/sendResponse.js";

import { OAuth2Client } from "google-auth-library";

import User from "../models/user/user.model.js";
import AuthSession from "../models/user/authSession.model.js";
import EmailVerificationOtp from "../models/user/emailVerificationOtp.model.js";

// Register
// =======================
export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      throw createHttpError("All fields are required", 400);
    }

    if (password !== confirmPassword) {
      throw createHttpError("Passwords do not match", 400);
    }

    validateSendOtp({ identifier: email, type: "email" });

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      throw createHttpError("Account already exists", 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash,
      authProvider: "email",
      isVerified: false,
      role: "user",
      is_active: true,
    });

    // Generate and send verification OTP
    const otp = generateOTP();
    const now = new Date();
    const expiry = new Date(now.getTime() + 5 * 60 * 1000);
    const cooldownUntil = new Date(now.getTime() + 60 * 1000);

    await EmailVerificationOtp.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          otp,
          expiresAt: expiry,
          cooldownUntil,
          attemptCount: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Reuse existing OTP email delivery content/SMTP setup
    await deliverEmailOtp({ identifier: user.email, otp });

    sendResponse(res, {
      message: "Registration successful. Please verify your email.",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// =======================
//  Verify Email
// =======================
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createHttpError("Email and OTP are required", 400);
    }

    validateSendOtp({ identifier: email, type: "email" });

    const normalizedEmail = email.trim().toLowerCase();

    const record = await EmailVerificationOtp.findOne({ email: normalizedEmail });
    if (!record) {
      throw createHttpError("Invalid OTP", 400);
    }

    if (record.expiresAt <= new Date()) {
      await record.deleteOne();
      throw createHttpError("OTP expired", 400);
    }

    if (record.cooldownUntil && record.cooldownUntil > new Date()) {
      // Optional cooldown enforcement (same idea as other OTP flows)
      throw createHttpError("Please wait before retrying OTP", 400);
    }

    if (record.attemptCount >= 5) {
      throw createHttpError("Too many attempts. Try again later.", 400);
    }

    if (record.otp !== otp.trim()) {
      record.attemptCount += 1;
      await record.save();
      throw createHttpError("Invalid OTP", 400);
    }

    // mark user verified
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw createHttpError("Account not found", 404);
    }

    user.isVerified = true;
    user.authProvider = user.authProvider || "email";
    await user.save();

    await record.deleteOne();

    // Issue JWT + session
    const token = config && config.JWT_SECRET ? jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    ) : null;

    if (!token) {
      throw new Error("JWT_SECRET missing");
    }

    await AuthSession.create({
      user_id: user._id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    sendResponse(res, {
      message: "Email verified successfully",
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
};

// =======================
// Login (email+password)
// =======================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError("Email and password are required", 400);
    }

    validateSendOtp({ identifier: email, type: "email" });

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw createHttpError("Account not found", 404);
    }

    if (user.authProvider !== "email") {
      throw createHttpError("Please sign in using Google", 400);
    }

    if (!user.isVerified) {
      throw createHttpError("Email is not verified", 403);
    }

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) {
      throw createHttpError("Invalid credentials", 400);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await AuthSession.create({
      user_id: user._id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    sendResponse(res, {
      message: "Login successful",
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// =======================
// Google Sign-In
// =======================
export const googleSignIn = async (req, res, next) => {
  try {
    // Expecting Google ID token/credential token from frontend
    const { credential } = req.body;

    if (!credential) {
      throw createHttpError("Google credential is required", 400);
    }

    if (!config.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID missing");
    }

    const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

    // Production-ready verification (NO jwt.decode)
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload?.email?.toLowerCase?.();
    const googleSub = payload?.sub;

    if (!googleEmail || !googleSub) {
      throw createHttpError("Invalid Google token", 400);
    }

    validateSendOtp({ identifier: googleEmail, type: "email" });

    const googleName = payload?.name || "User";
    // 'picture' exists on common Google ID tokens (may be undefined)
    const googlePicture = payload?.picture;

    let user = await User.findOne({ email: googleEmail });

    if (!user) {
      user = await User.create({
        name: googleName,
        email: googleEmail,
        password: undefined,
        googleId: googleSub,
        authProvider: "google",
        avatar: googlePicture,
        isVerified: true,
        role: "user",
        is_active: true,
      });
    } else {
      // Reuse existing account
      user.googleId = user.googleId || googleSub;
      user.authProvider = "google";
      user.isVerified = true;
      user.name = user.name || googleName;
      if (googlePicture) user.avatar = googlePicture;

      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await AuthSession.create({
      user_id: user._id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    sendResponse(res, {
      message: "Google login successful",
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
};

// =======================
//  Forgot Password
// =======================
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError("Email is required", 400);
    }

    validateSendOtp({ identifier: email, type: "email" });

    // For this migration, reuse email OTP model for reset as a temporary placeholder.
    // Phase 8 will replace with production reset token storage.
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail, is_active: true });
    if (!user) {
      throw createHttpError("Account not found", 404);
    }

    const otp = generateOTP();
    const now = new Date();
    const expiry = new Date(now.getTime() + 5 * 60 * 1000);
    const cooldownUntil = new Date(now.getTime() + 60 * 1000);

    // Store under same EmailVerificationOtp collection to avoid adding more models now.
    await EmailVerificationOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          otp,
          expiresAt: expiry,
          cooldownUntil,
          attemptCount: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await deliverEmailOtp({ identifier: normalizedEmail, otp });

    sendResponse(res, {
      message: "Password reset OTP sent successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// =======================
//  Reset Password
// =======================
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmNewPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmNewPassword) {
      throw createHttpError("All fields are required", 400);
    }

    if (newPassword !== confirmNewPassword) {
      throw createHttpError("Passwords do not match", 400);
    }

    validateSendOtp({ identifier: email, type: "email" });

    const normalizedEmail = email.trim().toLowerCase();

    const record = await EmailVerificationOtp.findOne({ email: normalizedEmail });
    if (!record) {
      throw createHttpError("Invalid OTP", 400);
    }

    if (record.expiresAt <= new Date()) {
      await record.deleteOne();
      throw createHttpError("OTP expired", 400);
    }

    if (record.attemptCount >= 5) {
      throw createHttpError("Too many attempts. Try again later.", 400);
    }

    if (record.otp !== otp.trim()) {
      record.attemptCount += 1;
      await record.save();
      throw createHttpError("Invalid OTP", 400);
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw createHttpError("Account not found", 404);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.password = passwordHash;
    user.authProvider = "email";
    user.isVerified = true;
    await user.save();

    await record.deleteOne();

    sendResponse(res, {
      message: "Password reset successful",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

// LOGOUT
export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw createHttpError("No token provided", 401);
    }

    await logoutUserSession(token);

    sendResponse(res, {
      message: "Logged out successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
