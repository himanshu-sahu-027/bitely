import express from "express";

import {
  cancelExistingOrder,
  createNewOrder,
  getActiveOrders,
  getOrderById,
  getOrderHistory,
  getOrders,
  reorderExistingOrder,
} from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { roleAuthorize } from "../middlewares/roleAuthorize.middleware.js";

const router = express.Router();

router.get("/", protect, roleAuthorize("user", "vendor", "admin"), getOrders);
router.get("/active", protect, roleAuthorize("user", "vendor", "admin"), getActiveOrders);
router.get("/history", protect, roleAuthorize("user", "vendor", "admin"), getOrderHistory);
router.get("/:orderId", protect, roleAuthorize("user", "vendor", "admin"), getOrderById);
router.post("/", protect, roleAuthorize("user", "vendor", "admin"), createNewOrder);
router.post("/:orderId/cancel", protect, roleAuthorize("user", "vendor", "admin"), cancelExistingOrder);
router.post("/:orderId/reorder", protect, roleAuthorize("user", "vendor", "admin"), reorderExistingOrder);

export default router;
