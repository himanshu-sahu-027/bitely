import { sendResponse } from "../utils/sendResponse.js";
import {
  addItemToCart,
  applyCartCoupon,
  clearUserCart,
  getUserCart,
  removeCartCoupon,
  removeCartItem,
  updateCartItemQuantity,
} from "../services/cartService/index.js";

export const getCart = async (req, res, next) => {
  try {
    const cart = await getUserCart(req.user._id);

    sendResponse(res, {
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const addCartItem = async (req, res, next) => {
  try {
    const cart = await addItemToCart({
      userId: req.user._id,
      menuId: req.body.menu_id,
      quantity: req.body.quantity ?? 1,
    });

    sendResponse(res, {
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const cart = await updateCartItemQuantity({
      userId: req.user._id,
      menuId: req.params.menuId,
      quantity: req.body.quantity,
    });

    sendResponse(res, {
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCartItem = async (req, res, next) => {
  try {
    const cart = await removeCartItem({
      userId: req.user._id,
      menuId: req.params.menuId,
    });

    sendResponse(res, {
      message: "Cart item removed successfully",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const applyCouponToCart = async (req, res, next) => {
  try {
    const cart = await applyCartCoupon({
      userId: req.user._id,
      code: req.body.code,
    });

    sendResponse(res, {
      message: "Coupon processed successfully",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const removeCouponFromCart = async (req, res, next) => {
  try {
    const cart = await removeCartCoupon({
      userId: req.user._id,
    });

    sendResponse(res, {
      message: "Coupon removed successfully",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await clearUserCart(req.user._id);

    sendResponse(res, {
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (err) {
    next(err);
  }
};
