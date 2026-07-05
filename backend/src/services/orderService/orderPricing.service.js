// Centralized pricing helpers for item totals, fees, tax, discounts, and final total.

export const calculateItemTotal = (items = []) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const calculatePriceBreakdown = ({
  items = [],
  packagingFee = 0,
  platformFee = 0,
  deliveryFee = 0,
  discount = 0,
  tax = 0,
} = {}) => {
  const itemTotal = calculateItemTotal(items);
  const finalTotal =
    itemTotal + packagingFee + platformFee + deliveryFee + tax - discount;

  return {
    itemTotal,
    packagingFee,
    platformFee,
    deliveryFee,
    discount,
    tax,
    finalTotal: Math.max(finalTotal, 0),
  };
};

export const applyCompensation = (pricing = {}, compensationAmount = 0) => ({
  ...pricing,
  compensationAmount,
  finalTotal: Math.max((pricing.finalTotal ?? 0) - compensationAmount, 0),
});
