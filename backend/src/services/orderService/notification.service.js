// Notification/event payload builders.
// These do not send notifications yet; they centralize future event hooks.

export const buildOrderPlacedEvent = (order) => ({
  type: "order.placed",
  orderId: order?._id ?? order?.id ?? null,
});

export const buildOrderDelayedEvent = (order, reason = "Delivery delayed") => ({
  type: "order.delayed",
  orderId: order?._id ?? order?.id ?? null,
  reason,
});

export const buildOrderCancelledEvent = (order) => ({
  type: "order.cancelled",
  orderId: order?._id ?? order?.id ?? null,
});

export const buildOrderDeliveredEvent = (order) => ({
  type: "order.delivered",
  orderId: order?._id ?? order?.id ?? null,
});
