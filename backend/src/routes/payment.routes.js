import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import {
  validateCreatePaymentOrderPayload,
  validateVerifyPaymentPayload,
} from "../validators/payment.validator.js";

const router = express.Router();

router.post(
  "/create-order",
  protect,
  validateBody(validateCreatePaymentOrderPayload),
  createPaymentOrder,
);
router.post(
  "/verify-payment",
  protect,
  validateBody(validateVerifyPaymentPayload),
  verifyPayment,
);

export default router;

