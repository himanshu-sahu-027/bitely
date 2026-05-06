import { COUPON_RULES, buildEmptyCoupon } from "./constants.js";

export const getCouponState = (couponCode, itemTotal) => {
  if (!couponCode) {
    return buildEmptyCoupon();
  }

  const formattedCode = couponCode.trim().toUpperCase();
  const rule = COUPON_RULES[formattedCode];

  if (!rule) {
    return {
      code: formattedCode,
      discount: 0,
      applied: false,
      error: "Invalid code",
    };
  }

  if (itemTotal < rule.min) {
    return {
      code: formattedCode,
      discount: 0,
      applied: false,
      error: `Add Rs. ${rule.min} to use this coupon`,
    };
  }

  return {
    code: formattedCode,
    discount: rule.discount,
    applied: true,
    error: "",
  };
};
