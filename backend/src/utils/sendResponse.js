export const sendResponse = (
  res,
  {
    statusCode = 200,
    success = true,
    message = "Request successful",
    data = null,
    ...meta
  } = {}
) => {
  const payload = {
    success,
    message,
    data,
  };

  Object.entries(meta).forEach(([key, value]) => {
    if (value !== undefined) {
      payload[key] = value;
    }
  });

  return res.status(statusCode).json(payload);
};
