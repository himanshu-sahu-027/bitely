// Notification/event payload builders.
// These do not send notifications yet; they centralize future event hooks.

export const buildOrderPlacedEvent = (order) => ({
  type: "order.placed",
  order_id: order?._id ?? order?.id ?? null,
});

export const buildOrderDelayedEvent = (order, reason = "Delivery delayed") => ({
  type: "order.delayed",
  order_id: order?._id ?? order?.id ?? null,
  reason,
});

export const buildOrderCancelledEvent = (order) => ({
  type: "order.cancelled",
  order_id: order?._id ?? order?.id ?? null,
});

export const buildOrderDeliveredEvent = (order) => ({
  type: "order.delivered",
  order_id: order?._id ?? order?.id ?? null,
});
