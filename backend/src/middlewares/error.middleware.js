export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((item) => item.message)
        .join(", "),
      data: null,
    });
  }

  let statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Server Error";

  if (statusCode === 500) {
    if (
      message === "Unauthorized" ||
      message === "User not found" ||
      message === "Session expired or logged out" ||
      message === "No token provided"
    ) {
      statusCode = 401;
    } else if (message === "Account is inactive") {
      statusCode = 403;
    } else if (message === "Address not found" || message === "User not found") {
      statusCode = 404;
    } else if (
      message === "Email already in use" ||
      message === "Required fields missing" ||
      message === "All fields are required" ||
      message === "Identifier and type are required" ||
      message === "Invalid type" ||
      message === "Invalid phone number" ||
      message === "Invalid email" ||
      message === "Invalid latitude" ||
      message === "Invalid longitude" ||
      message === "Address is required" ||
      message === "City is required" ||
      message === "State is required" ||
      message === "Pincode is required" ||
      message === "Invalid OTP" ||
      message === "Coupon code is required" ||
      message === "Invalid code" ||
      message === "Please wait before requesting OTP again" ||
      message === "Too many attempts. Try again later." ||
      message === "Invalid item quantity"
    ) {
      statusCode = 400;
    } else if (
      message === "Cart not found" ||
      message === "Cart item not found" ||
      message === "Menu item not found"
    ) {
      statusCode = 404;
    } else if (
      message === "Email OTP delivery is not configured." ||
      message === "SMS OTP delivery is not configured." ||
      message === "Redis is not available. OTP service is temporarily unavailable."
    ) {
      statusCode = 503;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};
