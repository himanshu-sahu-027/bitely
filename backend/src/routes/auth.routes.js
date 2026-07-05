import express from "express";
import {
  register,
  verifyEmail,
  login,
  googleSignIn,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { logout } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { roleAuthorize } from "../middlewares/roleAuthorize.middleware.js";


const router = express.Router();

// Production-style auth
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/google", googleSignIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/logout", protect, roleAuthorize("user", "vendor", "admin"), logout);

export default router;
