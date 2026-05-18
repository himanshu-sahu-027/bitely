import { createHttpError } from "../utils/createHttpError.js";

const ensureTrimmedString = (value, fieldName) => {
  if (typeof value !== "string" || !value.trim()) {
    throw createHttpError(`${fieldName} is required`, 400);
  }

  return value.trim();
};

const ensureValidCoordinate = (value, fieldName, min, max) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < min || numericValue > max) {
    throw createHttpError(`Invalid ${fieldName}`, 400);
  }

  return numericValue;
};

export const validateLocationPayload = (payload = {}) => ({
  latitude: ensureValidCoordinate(payload.latitude, "latitude", -90, 90),
  longitude: ensureValidCoordinate(payload.longitude, "longitude", -180, 180),
  address: ensureTrimmedString(payload.address, "Address"),
  city: ensureTrimmedString(payload.city, "City"),
  state: ensureTrimmedString(payload.state, "State"),
  pincode: ensureTrimmedString(payload.pincode, "Pincode"),
});
