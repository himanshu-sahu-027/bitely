import express from "express";
import { sendOTP, verifyOTPAndLogin } from "../controllers/auth.controller.js";
import { logout } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { roleAuthorize } from "../middlewares/roleAuthorize.middleware.js";


const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTPAndLogin);
router.post("/logout", protect, roleAuthorize("user", "vendor", "admin"), logout);

export default router;
