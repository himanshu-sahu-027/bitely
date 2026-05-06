import { createHttpError } from "../utils/createHttpError.js";

export const roleAuthorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createHttpError("Unauthorized", 401));
    }

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(req.user.role)
    ) {
      return next(createHttpError("Forbidden", 403));
    }

    next();
  };
};
