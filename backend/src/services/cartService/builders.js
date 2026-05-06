import { DELIVERY_FEE, GST_RATE, PLATFORM_FEE, buildEmptyCoupon } from "./constants.js";

export const normalizeKitchen = (kitchen) =>
  kitchen
    ? {
        id: String(kitchen._id),
        name: kitchen.name,
        image: kitchen.imageUrl ?? null,
        address: kitchen.address ?? "",
      }
    : null;

export const normalizeCartItems = (cartItems, menuById) =>
  cartItems.map((item) => {
    const menu = menuById[String(item.menu_id)];

    return {
      id: String(item.menu_id),
      cartItemId: String(item._id),
      name: menu?.name ?? "Menu item",
      price: item.price_at_time,
      image: menu?.imageUrl ?? null,
      quantity: item.quantity,
    };
  });

// Keep the backend cart totals aligned with the current frontend cart bill summary.
export const calculateCartPricing = ({ items = [], coupon = buildEmptyCoupon() }) => {
  const itemTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const gst = Math.round(itemTotal * GST_RATE);
  const discount = coupon.applied ? coupon.discount : 0;
  const total = itemTotal + DELIVERY_FEE + PLATFORM_FEE + gst - discount;

  return {
    itemTotal,
    deliveryFee: items.length > 0 ? DELIVERY_FEE : 0,
    platformFee: items.length > 0 ? PLATFORM_FEE : 0,
    gst: items.length > 0 ? gst : 0,
    discount,
    total: items.length > 0 ? Math.max(total, 0) : 0,
  };
};
