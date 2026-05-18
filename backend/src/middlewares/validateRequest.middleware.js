export const validateBody = (validator) => (req, res, next) => {
  try {
    req.validatedBody = validator(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
