import { clearOTP, generateOTP, storeOTP, verifyOTP } from "../services/otp.service.js";
import { loginOrSignupUser, logoutUserSession } from "../services/auth.service.js";
import { deliverOtp } from "../services/deliverOtp.service.js";
import { validateSendOtp } from "../utils/validateAuth.js";
import { createHttpError } from "../utils/createHttpError.js";
import { sendResponse } from "../utils/sendResponse.js";

// 📲 SEND OTP
export const sendOTP = async (req, res, next) => {
  try {
    const { identifier, type } = req.body;

    validateSendOtp({ identifier, type });

    const otp = generateOTP();

    await storeOTP(identifier, type, otp);
    try {
      await deliverOtp({ identifier, type, otp });
    } catch (error) {
      await clearOTP(identifier, type);
      throw error;
    }

    sendResponse(res, {
      message: "OTP sent successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};


//  VERIFY OTP + LOGIN/SIGNUP
export const verifyOTPAndLogin = async (req, res, next) => {
  try {
    const { identifier, type, otp, full_name } = req.body;

    if (!identifier || !type || !otp) {
      throw createHttpError("All fields are required", 400);
    }

    validateSendOtp({ identifier, type });

    const isValid = await verifyOTP(identifier, type, otp);

    if (!isValid) {
      throw createHttpError("Invalid OTP", 400);
    }

    const { token, user } = await loginOrSignupUser({
      identifier,
      type,
      full_name,
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
