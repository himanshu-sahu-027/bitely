import { createHttpError } from "../utils/createHttpError.js";

const ensureNonEmptyTrimmedString = (value, fieldName, { maxLength = 200 } = {}) => {
  if (typeof value !== "string") {
    throw createHttpError(`${fieldName} is required`, 400);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw createHttpError(`${fieldName} is required`, 400);
  }

  if (trimmed.length > maxLength) {
    throw createHttpError(`${fieldName} is too long`, 400);
  }

  return trimmed;
};

const ensureRequiredString = (value, fieldName) => {
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(`${fieldName} is required`, 400);
  }
  return value.trim();
};

export const validateCreatePaymentOrderPayload = (payload = {}) => {
  const { items, totalAmount, paymentMethod, deliveryAddress } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError("At least one order item is required", 400);
  }

  if (!Number.isFinite(Number(totalAmount)) || Number(totalAmount) <= 0) {
    throw createHttpError("A valid total amount is required", 400);
  }

  const allowedPaymentMethods = ["COD", "ONLINE"];
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    throw createHttpError("Payment method must be COD or ONLINE", 400);
  }

  if (!deliveryAddress?.addressLine || !deliveryAddress?.city || !deliveryAddress?.pincode) {
    throw createHttpError("Delivery address is incomplete", 400);
  }

  return {
    items,
    totalAmount,
    paymentMethod,
    deliveryAddress,
  };
};

export const validateVerifyPaymentPayload = (payload = {}) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw createHttpError("Payment verification payload is incomplete", 400);
  }

  return {
    orderId: ensureRequiredString(orderId, "orderId"),
    razorpayOrderId: ensureRequiredString(razorpayOrderId, "razorpay_order_id"),
    razorpayPaymentId: ensureRequiredString(razorpayPaymentId, "razorpay_payment_id"),
    razorpaySignature: ensureRequiredString(razorpaySignature, "razorpay_signature"),
  };
};

