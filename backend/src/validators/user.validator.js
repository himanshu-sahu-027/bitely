import { createHttpError } from "../utils/createHttpError.js";

const trimOptionalString = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw createHttpError("Invalid value", 400);
  }
  const trimmed = value.trim();
  return trimmed;
};

const ensureName = (value) => {
  if (typeof value !== "string") {
    throw createHttpError("name must be a string", 400);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw createHttpError("name is required", 400);
  }

  // reasonable limits to prevent abuse
  if (trimmed.length < 2 || trimmed.length > 80) {
    throw createHttpError("name length is invalid", 400);
  }

  return trimmed;
};

const ensureRequiredString = (value, fieldName, { min = 1, max = 200 } = {}) => {
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

const ensureOptionalString = (value, fieldName, { min = 1, max = 200 } = {}) => {
  if (value === undefined || value === null) return undefined;
  return ensureRequiredString(value, fieldName, { min, max });
};

const ensureValidCoordinate = (value, fieldName, min, max) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < min || numericValue > max) {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }

  return numericValue;
};

const ensureValidBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw createHttpError("is_default must be boolean", 400);
};

const ensureValidPincode = (value) => {
  const str = ensureRequiredString(value, "pincode", { min: 4, max: 10 });
  // Accept 4-6 digits (common India 6 digits), but keep generic.
  if (!/^\d{4,10}$/.test(str)) {
    throw createHttpError("pincode is invalid", 400);
  }
  return str;
};

export const validateUpdateProfilePayload = (payload = {}) => {
  const { name } = payload;

  // email must be treated as immutable; reject if provided
  if (payload.email !== undefined) {
    throw createHttpError("email cannot be updated", 400);
  }

  const validated = {};

  if (name !== undefined) {
    validated.name = ensureName(name);
  }

  if (Object.keys(validated).length === 0) {
    // nothing to update
    throw createHttpError("No valid fields provided", 400);
  }

  return validated;
};

export const validateCreateAddressPayload = (payload = {}) => {
  const validated = {
    label: ensureRequiredString(payload.label, "label", { min: 1, max: 120 }),
    address_line: ensureRequiredString(payload.address_line, "address_line", {
      min: 3,
      max: 250,
    }),
    city: ensureRequiredString(payload.city, "city", { min: 2, max: 80 }),
    state: ensureRequiredString(payload.state, "state", { min: 2, max: 80 }),
    pincode: ensureValidPincode(payload.pincode),
    latitude: ensureValidCoordinate(payload.latitude, "latitude", -90, 90),
    longitude: ensureValidCoordinate(payload.longitude, "longitude", -180, 180),
    ...(payload.is_default !== undefined
      ? { is_default: ensureValidBoolean(payload.is_default) }
      : {}),
  };

  // Reject attempts to set immutable/internal fields
  if (payload.user_id !== undefined || payload.createdAt !== undefined || payload.updatedAt !== undefined) {
    throw createHttpError("Invalid fields", 400);
  }

  return validated;
};

export const validateUpdateAddressPayload = (payload = {}) => {
  const validated = {};

  if (payload.label !== undefined) {
    validated.label = ensureOptionalString(payload.label, "label", { min: 1, max: 120 });
  }

  if (payload.address_line !== undefined) {
    validated.address_line = ensureOptionalString(payload.address_line, "address_line", {
      min: 3,
      max: 250,
    });
  }

  if (payload.city !== undefined) {
    validated.city = ensureOptionalString(payload.city, "city", { min: 2, max: 80 });
  }

  if (payload.state !== undefined) {
    validated.state = ensureOptionalString(payload.state, "state", { min: 2, max: 80 });
  }

  if (payload.pincode !== undefined) {
    validated.pincode = ensureValidPincode(payload.pincode);
  }

  if (payload.latitude !== undefined) {
    validated.latitude = ensureValidCoordinate(payload.latitude, "latitude", -90, 90);
  }

  if (payload.longitude !== undefined) {
    validated.longitude = ensureValidCoordinate(payload.longitude, "longitude", -180, 180);
  }

  if (payload.is_default !== undefined) {
    validated.is_default = ensureValidBoolean(payload.is_default);
  }

  // Require at least one valid editable field
  if (Object.keys(validated).length === 0) {
    throw createHttpError("No valid fields provided", 400);
  }

  // Reject attempts to set immutable/internal fields
  if (payload.user_id !== undefined || payload.createdAt !== undefined || payload.updatedAt !== undefined) {
    throw createHttpError("Invalid fields", 400);
  }

  return validated;
};

