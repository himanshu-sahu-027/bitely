// Order status transition rules and status-history helpers.

export const ORDER_STATUS_TRANSITIONS = {
  placed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const canTransitionOrderStatus = (currentStatus, nextStatus) =>
  ORDER_STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;

export const assertValidOrderTransition = (currentStatus, nextStatus) => {
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    const error = new Error(
      `Invalid order status transition: ${currentStatus} -> ${nextStatus}`
    );
    error.statusCode = 400;
    throw error;
  }
};

export const buildStatusHistoryEntry = ({
  orderId,
  status,
  message,
  createdAt = new Date(),
}) => ({
  order_id: orderId,
  status,
  message,
  created_at: createdAt,
});

export const checkCancellationEligibility = ({
  order,
  now = new Date(),
}) => {
  if (!order) {
    return {
      canCancel: false,
      reason: "Order not found",
      refundRule: "none",
    };
  }

  if (["delivered", "cancelled"].includes(order.status)) {
    return {
      canCancel: false,
      reason: "Order can no longer be cancelled",
      refundRule: "none",
    };
  }

  const cancellationDeadline = order.last_cancellation_time
    ? new Date(order.last_cancellation_time)
    : null;

  if (cancellationDeadline && now > cancellationDeadline) {
    return {
      canCancel: false,
      reason: "Cancellation window has expired",
      refundRule: order.payment_status === "paid" ? "manual_review" : "none",
    };
  }

  return {
    canCancel: true,
    reason: null,
    refundRule: order.payment_status === "paid" ? "full_refund" : "none",
  };
};
