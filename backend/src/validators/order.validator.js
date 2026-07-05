import { createHttpError } from "../utils/createHttpError.js";

const ensureTrimmedString = (value, fieldName, { min = 1, max = 200 } = {}) => {
  if (typeof value !== "string") {
    throw createHttpError(`${fieldName} is required`, 400);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw createHttpError(`${fieldName} is required`, 400);
  }

  if (trimmed.length < min || trimmed.length > max) {
    throw createHttpError(`${fieldName} is invalid`, 400);
  }

  return trimmed;
};

const ensureEnum = (value, fieldName, allowedValues = []) => {
  if (!allowedValues.includes(value)) {
    throw createHttpError(`${fieldName} is invalid`, 400);
  }
  return value;
};

const ensureNonEmptyArray = (value, fieldName) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw createHttpError(`${fieldName} is required`, 400);
  }
  return value;
};

const ensureInteger = (value, fieldName) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || !Number.isInteger(numericValue)) {
    throw createHttpError(`${fieldName} must be an integer`, 400);
  }
  return numericValue;
};

// Existing app values: order.service.js defaults to `paymentStatus = "pending"`
const PAYMENT_METHODS = ["razorpay", "cod"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];

export const validateCreateOrderPayload = (payload = {}) => {
  const { kitchenId, paymentMethod, paymentStatus, items = [], instructions } = payload;

  const validatedItems = ensureNonEmptyArray(items, "items").map((item, idx) => {
    const menuId = ensureTrimmedString(item?.menuId, `items[${idx}].menuId`, {
      min: 1,
      max: 200,
    });

    const quantity = ensureInteger(item?.quantity, `items[${idx}].quantity`);
    if (quantity < 1) {
      throw createHttpError(`items[${idx}].quantity must be >= 1`, 400);
    }

    return { menuId, quantity };
  });

  if (kitchenId === undefined) {
    throw createHttpError("kitchenId is required", 400);
  }
  const validatedKitchenId = ensureTrimmedString(kitchenId, "kitchenId", {
    min: 1,
    max: 200,
  });

  if (paymentMethod === undefined) {
    throw createHttpError("paymentMethod is required", 400);
  }
  const validatedPaymentMethod = ensureEnum(
    paymentMethod,
    "paymentMethod",
    PAYMENT_METHODS
  );

  const validatedPaymentStatus =
    paymentStatus === undefined || paymentStatus === null
      ? undefined
      : ensureEnum(paymentStatus, "paymentStatus", PAYMENT_STATUSES);

  // Keep instructions untouched/optional (pricing/service already tolerates it)
  const validatedInstructions =
    instructions === undefined
      ? undefined
      : typeof instructions === "string" && instructions.trim().length > 0
        ? instructions.trim()
        : typeof instructions === "string"
          ? ""
          : (() => {
              throw createHttpError("instructions must be a string", 400);
            })();

  return {
    kitchenId: validatedKitchenId,
    paymentMethod: validatedPaymentMethod,
    ...(validatedPaymentStatus !== undefined
      ? { paymentStatus: validatedPaymentStatus }
      : {}),
    items: validatedItems,
    ...(validatedInstructions !== undefined ? { instructions: validatedInstructions } : {}),
  };
};

