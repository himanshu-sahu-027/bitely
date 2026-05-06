// Payment-state helpers for reconciliation, capture, and refund workflows.

export const isPaymentCompleted = (paymentStatus) => paymentStatus === "paid";

export const mapPaymentStatus = (payment) => ({
  order_id: payment.order_id,
  method: payment.method,
  status: payment.status,
  amount: payment.amount,
  transaction_id: payment.transaction_id,
  paid_at: payment.paid_at,
});

export const reconcilePaymentState = ({ order, payment }) => ({
  order_id: order?._id ?? order?.id ?? null,
  order_payment_status: order?.payment_status ?? "pending",
  payment_status: payment?.status ?? "pending",
  is_consistent:
    (order?.payment_status ?? "pending") ===
    (payment?.status === "success" ? "paid" : payment?.status ?? "pending"),
});

export const buildRefundPayload = ({
  orderId,
  amount,
  reason = "Order cancelled",
  type = "full_refund",
}) => ({
  order_id: orderId,
  refund_amount: amount,
  refund_reason: reason,
  refund_type: type,
});
