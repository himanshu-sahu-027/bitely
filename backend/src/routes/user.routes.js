import express from "express";
import {
  getMe,
  updateProfile,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
} from "../controllers/user.controller.js";
import { createUserLocation } from "../controllers/location.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import { roleAuthorize } from "../middlewares/roleAuthorize.middleware.js";
import { validateLocationPayload } from "../validators/location.validator.js";

const router = express.Router();

// profile
router.get("/me", protect, roleAuthorize("user", "vendor", "admin"), getMe);
router.put("/update-profile", protect, roleAuthorize("user", "vendor", "admin"), updateProfile);

// address
router.post("/address", protect, roleAuthorize("user", "vendor", "admin"), addAddress);
router.get("/address", protect, roleAuthorize("user", "vendor", "admin"), getAddresses);
router.put("/address/:id", protect, roleAuthorize("user", "vendor", "admin"), updateAddress);
router.delete("/address/:id", protect, roleAuthorize("user", "vendor", "admin"), deleteAddress);
router.post(
  "/location",
  protect,
  roleAuthorize("user", "vendor", "admin"),
  validateBody(validateLocationPayload),
  createUserLocation,
);

export default router;
