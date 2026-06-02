import crypto from "crypto";
import mongoose from "mongoose";

import { config } from "../config/env.js";
import { Order } from "../models/orderCatalog/index.js";
import { createHttpError } from "../utils/createHttpError.js";
import { getRazorpayInstance, isRazorpayConfigured } from "../utils/razorpay.js";
import { sendResponse } from "../utils/sendResponse.js";

const ALLOWED_PAYMENT_METHODS = ["COD", "ONLINE"];

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
    kitchen_id:
      firstItem.kitchenId ||
      firstItem.kitchen_id ||
      new mongoose.Types.ObjectId(),
    kitchen_name: firstItem.kitchenName || firstItem.kitchen_name || "Bitely Kitchen",
    kitchen_image_url: firstItem.kitchenImage || firstItem.kitchen_image_url || "",
  };
};

const validateCreateOrderPayload = ({ items, totalAmount, paymentMethod, deliveryAddress }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError("At least one order item is required", 400);
  }

  if (!Number.isFinite(Number(totalAmount)) || Number(totalAmount) <= 0) {
    throw createHttpError("A valid total amount is required", 400);
  }

  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    throw createHttpError("Payment method must be COD or ONLINE", 400);
  }

  if (!deliveryAddress?.addressLine || !deliveryAddress?.city || !deliveryAddress?.pincode) {
    throw createHttpError("Delivery address is incomplete", 400);
  }
};

const buildOrderDocument = ({ req, normalizedItems }) => {
  const userId = req.user?._id || req.body.user || null;
  const paymentMethod = req.body.paymentMethod;
  const totalAmount = Number(req.body.totalAmount);
  const fallbackKitchen = buildFallbackKitchen(normalizedItems);

  return {
    user: userId,
    user_id: userId,
    items: normalizedItems,
    totalAmount,
    total_amount: totalAmount,
    paymentMethod,
    payment_method: paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "pending" : "pending",
    payment_status: paymentMethod === "COD" ? "pending" : "pending",
    deliveryAddress: req.body.deliveryAddress,
    orderStatus: "placed",
    status: "placed",
    placed_at: new Date(),
    instructions: req.body.instructions || "",
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
    notes: {
      platform: "bitely-test-mode",
    },
  });
};

const buildSignature = ({ razorpayOrderId, razorpayPaymentId, secret }) =>
  crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

export const createPaymentOrder = async (req, res, next) => {
  try {
    validateCreateOrderPayload(req.body);

    const normalizedItems = normalizeItems(req.body.items);
    const order = await Order.create(buildOrderDocument({ req, normalizedItems }));

    if (req.body.paymentMethod === "COD") {
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

    const amountInPaise = Math.round(Number(req.body.totalAmount) * 100);
    const receipt = `bitely_${order._id}_${Date.now()}`;
    const razorpayOrder = await createGatewayOrder({
      amount: amountInPaise,
      receipt,
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return sendResponse(res, {
      statusCode: 201,
      message: "Razorpay test order created successfully",
      data: {
        order,
        razorpayOrder,
        keyId: config.RAZORPAY_KEY_ID,
        mode: "RAZORPAY_TEST",
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
    } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw createHttpError("Payment verification payload is incomplete", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw createHttpError("Order not found", 404);
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

    const isSignatureValid = expectedSignature === razorpaySignature;

    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paymentStatus = isSignatureValid ? "paid" : "failed";
    order.payment_status = order.paymentStatus;

    await order.save();

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
