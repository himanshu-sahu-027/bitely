// Shared cart pricing and coupon defaults used across the cart service.
export const DELIVERY_FEE = 30;
export const PLATFORM_FEE = 0;
export const GST_RATE = 0.05;

export const COUPON_RULES = {
  BITELY50: { discount: 50, min: 200 },
  SAVE100: { discount: 100, min: 400 },
};

export const buildEmptyCoupon = () => ({
  code: "",
  discount: 0,
  applied: false,
  error: "",
});
