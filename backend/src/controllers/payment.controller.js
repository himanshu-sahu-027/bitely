import crypto from "crypto";
import mongoose from "mongoose";

import { config } from "../config/env.js";
import { Order } from "../models/orderCatalog/index.js";
import { createHttpError } from "../utils/createHttpError.js";
import { getRazorpayInstance, isRazorpayConfigured } from "../utils/razorpay.js";
import { sendResponse } from "../utils/sendResponse.js";
import Menu from "../models/kitchenCatalog/menu.model.js";
import {
  createPayment,
  markPaymentPaid,
  markPaymentFailed,
} from "../services/orderService/payment.service.js";

const normalizeItems = (items = []) =>
  items.map((item) => ({
    menuId: item.menuId || item.menu_id || item.id || null,
    name: item.name,
    quantity: Number(item.quantity || 1),
    price: Number(item.price || 0),
    image: item.image || item.image_url || "",
  }));

const buildFallbackKitchen = (items = []) => {
  const firstItem = items[0] || {};

  return {
    kitchenId:
      firstItem.kitchenId ||
      firstItem.kitchen_id ||
      new mongoose.Types.ObjectId(),
    kitchenName:
      firstItem.kitchenName || firstItem.kitchen_name || "Bitely Kitchen",
    kitchenImageUrl:
      firstItem.kitchenImage ||
      firstItem.kitchen_image_url ||
      "",
  };
};

const buildOrderDocument = ({
  req,
  normalizedItems,
  totalAmount,
  paymentMethod,
  deliveryAddress,
  instructions,
}) => {
  const userId = req.user._id;
  const fallbackKitchen = buildFallbackKitchen(normalizedItems);

  return {
    user: userId,
    userId: userId,
    items: normalizedItems,
    totalAmount,
    paymentMethod,
    paymentStatus: "pending",
    deliveryAddress,
    orderStatus: "placed",
    placedAt: new Date(),
    instructions: instructions || "",
    ...fallbackKitchen,
  };
};

const createGatewayOrder = async ({ amount, receipt }) => {
  if (!isRazorpayConfigured()) {
    throw createHttpError(
      "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_SECRET in the backend env.",
      500,
    );
  }

  const razorpay = getRazorpayInstance();

  return razorpay.orders.create({
    amount,
    currency: "INR",
    receipt,
  });
};

const buildSignature = ({ razorpayOrderId, razorpayPaymentId, secret }) =>
  crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

export const createPaymentOrder = async (req, res, next) => {
  try {
    const payload = req.validatedBody;

    // Recompute pricing on the server to prevent tampering with totalAmount and item prices.
    const normalizedClientItems = normalizeItems(payload.items);

    // Required: if any menuId is missing, return 404.
    const hasMissingMenuId = normalizedClientItems.some(
      (item) => !item.menuId || !String(item.menuId)
    );

    if (hasMissingMenuId) {
      throw createHttpError("Menu not found", 404);
    }

    const menuIds = normalizedClientItems.map((item) => item.menuId);

    if (menuIds.length === 0) {
      throw createHttpError("At least one order item is required", 400);
    }

    const menus = await Menu.find({
      _id: { $in: menuIds },
    })
      .select("_id price kitchen_id")
      .lean();

    // Required: if any menuId is not found in DB, return 404.
    if (!menus || menus.length !== new Set(menuIds.map(String)).size) {
      throw createHttpError("Menu not found", 404);
    }

    const menuPriceMap = new Map(menus.map((m) => [String(m._id), m.price]));

    for (const [id, price] of menuPriceMap.entries()) {
      if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        throw createHttpError("Invalid menu price", 400);
      }
    }

    const normalizedItems = normalizedClientItems.map((item) => {
      const idKey = String(item.menuId);

      if (!menuPriceMap.has(idKey)) {
        throw createHttpError("Menu not found", 404);
      }

      const serverPrice = menuPriceMap.get(idKey);

      return { ...item, price: Number(serverPrice) };
    });

    const serverTotalAmount = normalizedItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.price),
      0
    );

    const order = await Order.create(
      buildOrderDocument({
        req,
        normalizedItems,
        totalAmount: serverTotalAmount,
        paymentMethod: payload.paymentMethod,
        deliveryAddress: payload.deliveryAddress,
        instructions: payload.instructions || "",
      })
    );

    if (payload.paymentMethod === "COD") {
      return sendResponse(res, {
        statusCode: 201,
        message: "COD order created successfully",
        data: {
          order,
          razorpayOrder: null,
          mode: "COD",
        },
      });
    }

    const amountInPaise = Math.round(Number(serverTotalAmount) * 100);
    const receipt = `bitely_${order._id}_${Date.now()}`;
    const razorpayOrder = await createGatewayOrder({
      amount: amountInPaise,
      receipt,
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    await createPayment({
      orderId: order._id,
      userId: order.userId,
      kitchenId: order.kitchenId,
      gateway: "razorpay",
      gatewayOrderId: razorpayOrder.id,
      transactionId: null,
      gatewaySignature: null,
      amount: order.totalAmount,
      method: order.paymentMethod,
      currency: "INR",
      status: "pending",
      paidAt: null,
    });

    return sendResponse(res, {
      statusCode: 201,
      message: "Razorpay order created successfully",
      data: {
        order,
        razorpayOrder,
        keyId: config.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.validatedBody;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw createHttpError("Payment verification payload is incomplete", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw createHttpError("Order not found", 404);
    }

    // Idempotency: if payment already verified as paid, do not overwrite payment details.
    if (order.paymentStatus === "paid") {
      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Payment already verified",
        data: {
          order,
          alreadyProcessed: true,
        },
      });
    }

    // Authorization: only allow verifying payment for the appropriate order owner.
    // - Admin: allow
    // - Normal user: only own orders
    // - Vendor: allow only if order belongs to vendor's kitchen (if kitchen_id is present)
    //   Otherwise deny (prevents cross-kitchen/payment verification).
    const actor = {
      role: req.user?.role,
      userId: req.user?._id,
      kitchenId: req.user?.kitchenId || req.user?.kitchen_id || null,
    };

    if (actor.role === "user") {
      if (!String(order.userId) || String(order.userId) !== String(actor.userId)) {
        throw createHttpError("Unauthorized", 403);
      }
    } else if (actor.role === "vendor") {
      if (!actor.kitchenId) {
        throw createHttpError("Unauthorized", 403);
      }
      // order.kitchenId may be an ObjectId or populated doc id; normalize as string.
      if (!String(order.kitchenId) || String(order.kitchenId) !== String(actor.kitchenId)) {
        throw createHttpError("Unauthorized", 403);
      }
    } else if (actor.role === "admin") {
      // allow
    } else {
      // deny any unknown role
      throw createHttpError("Forbidden", 403);
    }

    if (!isRazorpayConfigured()) {
      throw createHttpError(
        "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_SECRET in the backend env.",
        500,
      );
    }

    // Razorpay verification compares the payment signature generated by
    // Razorpay against the signature we rebuild on the server.
    const verificationSecret = config.RAZORPAY_KEY_SECRET;

    const expectedSignature = buildSignature({
      razorpayOrderId,
      razorpayPaymentId,
      secret: verificationSecret,
    });

    const expectedSigBuf = Buffer.from(expectedSignature, "utf8");
    const providedSigBuf = Buffer.from(razorpaySignature, "utf8");

    const isSignatureValid =
      expectedSigBuf.length === providedSigBuf.length &&
      crypto.timingSafeEqual(expectedSigBuf, providedSigBuf);

    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentStatus = isSignatureValid ? "paid" : "failed";

    await order.save();

    if (isSignatureValid) {
      await markPaymentPaid(orderId, {
        transactionId: razorpayPaymentId,
        gatewaySignature: razorpaySignature,
      });
    } else {
      await markPaymentFailed(orderId, "Payment signature verification failed");
    }

    if (!isSignatureValid) {
      throw createHttpError("Payment signature verification failed", 400);
    }

    return sendResponse(res, {
      message: "Payment verified successfully",
      data: {
        order,
        isSignatureValid,
      },
    });
  } catch (error) {
    next(error);
  }
};
