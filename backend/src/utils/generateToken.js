import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
