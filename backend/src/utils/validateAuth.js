import { createHttpError } from "./createHttpError.js";

export const validateSendOtp = ({ identifier, type }) => {
  if (!identifier || !type) {
    throw createHttpError("Identifier and type are required", 400);
  }

  if (!["phone", "email"].includes(type)) {
    throw createHttpError("Invalid type", 400);
  }

  if (type === "phone" && !/^[6-9]\d{9}$/.test(identifier)) {
    throw createHttpError("Invalid phone number", 400);
  }

  if (
    type === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
  ) {
    throw createHttpError("Invalid email", 400);
  }
};
