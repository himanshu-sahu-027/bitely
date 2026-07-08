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
import PendingSignup from "../models/user/pendingSignup.model.js";

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

    const normalizedEmail = email.trim().toLowerCase();

    validateSendOtp({ identifier: normalizedEmail, type: "email" });

    // Reject verified users
    const existingVerifiedUser = await User.findOne({ email: normalizedEmail });
    if (existingVerifiedUser) {
      throw createHttpError("Account already exists", 400);
    }

    // Generate OTP and timestamps
    const passwordHash = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const now = new Date();
    const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000);
    const cooldownUntil = new Date(now.getTime() + 60 * 1000);

    // Upsert pending signup (replace if a valid pending signup exists)
    await PendingSignup.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          expiresAt: otpExpiry,
          createdBy: "email",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Store OTP in EmailVerificationOtp (OTP lifecycle remains isolated here)
    await EmailVerificationOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          otp,
          expiresAt: otpExpiry,
          cooldownUntil,
          attemptCount: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email
    try {
      await deliverEmailOtp({ identifier: normalizedEmail, otp });

      sendResponse(res, {
        message: "Registration successful. Please verify your email.",
        data: null,
      });
    } catch (emailErr) {
      // Cleanup OTP + pending signup if email sending fails
      await Promise.all([
        EmailVerificationOtp.deleteMany({ email: normalizedEmail }).catch(() => null),
        PendingSignup.deleteMany({ email: normalizedEmail }).catch(() => null),
      ]);

      throw emailErr;
    }
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

    const normalizedEmail = email.trim().toLowerCase();

    validateSendOtp({ identifier: normalizedEmail, type: "email" });

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

    const pending = await PendingSignup.findOne({ email: normalizedEmail });
    if (!pending) {
      throw createHttpError("Pending signup not found", 400);
    }

    if (pending.expiresAt <= new Date()) {
      await pending.deleteOne().catch(() => null);
      throw createHttpError("OTP expired", 400);
    }

    // Ensure no verified user exists (avoid duplicates)
    const alreadyVerifiedUser = await User.findOne({ email: normalizedEmail });
    if (alreadyVerifiedUser) {
      // Cleanup stale OTP if any
      await record.deleteOne().catch(() => null);
      throw createHttpError("Account already verified", 400);
    }

    // Create the verified user only after successful OTP validation
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.passwordHash,
      authProvider: "email",
      isVerified: true,
      role: "user",
      is_active: true,
    });

    // Cleanup: delete pending + OTP
    await Promise.all([
      pending.deleteOne().catch(() => null),
      record.deleteOne().catch(() => null),
    ]);

    // Issue JWT + session (do not change response contract)
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
//  Resend Verification OTP
// =======================
export const resendVerificationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError("Email is required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Ensure there is a pending signup to resend for
    const pending = await PendingSignup.findOne({ email: normalizedEmail });
    if (!pending) {
      throw createHttpError(
        "No pending signup found for this email. Please register again.",
        404,
      );
    }

    if (pending.expiresAt <= new Date()) {
      await pending.deleteOne().catch(() => null);
      throw createHttpError(
        "Pending signup expired. Please register again.",
        404,
      );
    }

    // Generate new OTP + timestamps
    const otp = generateOTP();
    const now = new Date();
    const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000);
    const cooldownUntil = new Date(now.getTime() + 60 * 1000);

    // Replace/update OTP record
    await EmailVerificationOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          otp,
          expiresAt: otpExpiry,
          cooldownUntil,
          attemptCount: 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // Send OTP email (verification purpose)
    await deliverEmailOtp({ identifier: normalizedEmail, otp });

    sendResponse(res, {
      message: "Verification OTP resent successfully",
      data: null,
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
