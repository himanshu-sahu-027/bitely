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

const ensureInteger = (value, fieldName) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || !Number.isInteger(numericValue)) {
    throw createHttpError(`${fieldName} must be an integer`, 400);
  }

  return numericValue;
};

export const validateAddCartItemPayload = (payload = {}) => {
  const validated = {
    menu_id: ensureTrimmedString(payload.menu_id, "menu_id"),
  };

  // quantity optional; default 1
  if (payload.quantity === undefined || payload.quantity === null || payload.quantity === "") {
    validated.quantity = 1;
  } else {
    const qty = ensureInteger(payload.quantity, "quantity");
    if (qty <= 0) {
      throw createHttpError("quantity must be a positive integer", 400);
    }
    validated.quantity = qty;
  }

  return validated;
};

export const validateUpdateCartItemQuantityPayload = (payload = {}) => {
  const validated = {};

  if (payload.quantity === undefined || payload.quantity === null) {
    throw createHttpError("quantity is required", 400);
  }

  const qty = ensureInteger(payload.quantity, "quantity");
  if (qty < 0) {
    throw createHttpError("quantity must be >= 0", 400);
  }

  validated.quantity = qty;

  return validated;
};

export const validateApplyCouponPayload = (payload = {}) => {
  return {
    code: ensureTrimmedString(payload.code, "code", { min: 1, max: 50 }),
  };
};

