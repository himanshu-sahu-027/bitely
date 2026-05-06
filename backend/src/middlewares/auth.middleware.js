import jwt from "jsonwebtoken";
import User from "../models/user/user.model.js";
import AuthSession from "../models/user/authSession.model.js";
import { createHttpError } from "../utils/createHttpError.js";
import { config } from "../config/env.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw createHttpError("Unauthorized", 401);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const session = await AuthSession.findOne({ token });

    if (!session) {
      throw createHttpError("Session expired or logged out", 401);
    }

    if (session.expires_at && session.expires_at < new Date()) {
      await AuthSession.deleteOne({ _id: session._id });
      throw createHttpError("Session expired or logged out", 401);
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      throw createHttpError("User not found", 401);
    }

    if (!user.is_active) {
      throw createHttpError("Account is inactive", 403);
    }

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};
