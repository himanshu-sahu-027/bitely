import express from "express";
import {
  addCartItem,
  applyCouponToCart,
  clearCart,
  deleteCartItem,
  getCart,
  removeCouponFromCart,
  updateCartItem,
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { roleAuthorize } from "../middlewares/roleAuthorize.middleware.js";
import { validateBody } from "../middlewares/validateRequest.middleware.js";
import {
  validateAddCartItemPayload,
  validateApplyCouponPayload,
  validateUpdateCartItemQuantityPayload,
} from "../validators/cart.validator.js";

const router = express.Router();

router.use(protect, roleAuthorize("user", "vendor", "admin"));

router.get("/", getCart);
router.post("/items", validateBody(validateAddCartItemPayload), addCartItem);
router.put(
  "/items/:menuId",
  validateBody(validateUpdateCartItemQuantityPayload),
  updateCartItem,
);
router.delete("/items/:menuId", deleteCartItem);
router.post(
  "/coupon",
  validateBody(validateApplyCouponPayload),
  applyCouponToCart,
);
router.delete("/coupon", removeCouponFromCart);
router.delete("/", clearCart);

export default router;

