import { CartItem } from "../../models/orderCatalog/index.js";
import { createHttpError } from "../../utils/createHttpError.js";
import { calculateCartPricing, normalizeCartItems, normalizeKitchen } from "./builders.js";
import { getCouponState } from "./coupons.js";
import { buildEmptyCoupon } from "./constants.js";
import {
  clearCartItems,
  getCartAndMenu,
  getLatestUserCart,
  loadCartSnapshot,
} from "./queries.js";

const buildCartResponse = async (cartDoc) => {
  if (!cartDoc) {
    const coupon = buildEmptyCoupon();

    return {
      id: null,
      restaurant: null,
      items: [],
      coupon,
      pricing: calculateCartPricing({ items: [], coupon }),
    };
  }

  const { kitchen, cartItems, menuById } = await loadCartSnapshot(cartDoc);
  const items = normalizeCartItems(cartItems, menuById);

  if (items.length === 0) {
    const coupon = buildEmptyCoupon();

    return {
      id: String(cartDoc._id),
      restaurant: null,
      items: [],
      coupon,
      instructions: "",
      pricing: calculateCartPricing({ items: [], coupon }),
    };
  }

  const itemTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const coupon = getCouponState(cartDoc.coupon_code, itemTotal);

  return {
    id: String(cartDoc._id),
    restaurant: normalizeKitchen(kitchen),
    items,
    coupon,
    instructions: cartDoc.instructions ?? "",
    pricing: calculateCartPricing({ items, coupon }),
  };
};

export const getUserCart = async (userId) => {
  const cart = await getLatestUserCart(userId);
  return buildCartResponse(cart);
};

export const addItemToCart = async ({ userId, menuId, quantity = 1 }) => {
  const parsedQuantity = Number.parseInt(quantity, 10);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
    throw createHttpError("Invalid item quantity", 400);
  }

  const { cart, menu } = await getCartAndMenu({ userId, menuId });
  const existingItem = await CartItem.findOne({
    cart_id: cart._id,
    menu_id: menu._id,
  });

  if (existingItem) {
    existingItem.quantity += parsedQuantity;
    existingItem.price_at_time = menu.price;
    await existingItem.save();
  } else {
    await CartItem.create({
      cart_id: cart._id,
      menu_id: menu._id,
      quantity: parsedQuantity,
      price_at_time: menu.price,
    });
  }

  return buildCartResponse(cart);
};

export const updateCartItemQuantity = async ({
  userId,
  menuId,
  quantity,
}) => {
  const parsedQuantity = Number.parseInt(quantity, 10);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
    throw createHttpError("Invalid item quantity", 400);
  }

  const cart = await getLatestUserCart(userId);

  if (!cart) {
    throw createHttpError("Cart not found", 404);
  }

  const item = await CartItem.findOne({
    cart_id: cart._id,
    menu_id: menuId,
  });

  if (!item) {
    throw createHttpError("Cart item not found", 404);
  }

  if (parsedQuantity === 0) {
    await item.deleteOne();
  } else {
    item.quantity = parsedQuantity;
    await item.save();
  }

  const remainingItems = await CartItem.countDocuments({ cart_id: cart._id });
  if (remainingItems === 0) {
    cart.coupon_code = "";
    await cart.save();
  }

  return buildCartResponse(cart);
};

export const removeCartItem = async ({ userId, menuId }) => {
  const cart = await getLatestUserCart(userId);

  if (!cart) {
    throw createHttpError("Cart not found", 404);
  }

  const item = await CartItem.findOneAndDelete({
    cart_id: cart._id,
    menu_id: menuId,
  });

  if (!item) {
    throw createHttpError("Cart item not found", 404);
  }

  const remainingItems = await CartItem.countDocuments({ cart_id: cart._id });
  if (remainingItems === 0) {
    cart.coupon_code = "";
    await cart.save();
  }

  return buildCartResponse(cart);
};

export const applyCartCoupon = async ({ userId, code }) => {
  const formattedCode = String(code || "").trim().toUpperCase();

  if (!formattedCode) {
    throw createHttpError("Coupon code is required", 400);
  }

  const cart = await getLatestUserCart(userId);

  if (!cart) {
    throw createHttpError("Cart not found", 404);
  }

  const cartResponse = await buildCartResponse(cart);
  const coupon = getCouponState(formattedCode, cartResponse.pricing.itemTotal);

  cart.coupon_code = formattedCode;
  await cart.save();

  return {
    ...cartResponse,
    coupon,
    pricing: calculateCartPricing({
      items: cartResponse.items,
      coupon,
    }),
  };
};

export const removeCartCoupon = async ({ userId }) => {
  const cart = await getLatestUserCart(userId);

  if (!cart) {
    throw createHttpError("Cart not found", 404);
  }

  cart.coupon_code = "";
  await cart.save();

  return buildCartResponse(cart);
};

export const clearUserCart = async (userId) => {
  const cart = await getLatestUserCart(userId);

  if (!cart) {
    return buildCartResponse(null);
  }

  await clearCartItems(cart._id);
  cart.coupon_code = "";
  cart.instructions = "";
  await cart.save();

  return buildCartResponse(cart);
};
