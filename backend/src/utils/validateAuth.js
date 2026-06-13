import { createHttpError } from "./createHttpError.js";

export const validateSendOtp = ({ identifier, type }) => {
  if (!identifier || !type) {
    throw createHttpError("Identifier and type are required", 400);
  }

  if (!["email"].includes(type)) {
    throw createHttpError("Invalid type", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    throw createHttpError("Invalid email", 400);
  }
};
