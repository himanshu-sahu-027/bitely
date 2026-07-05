import Payment from "../../models/orderCatalog/payment.model.js";

// Payment-state helpers for reconciliation, capture, and refund workflows.

export const isPaymentCompleted = (paymentStatus) => paymentStatus === "paid";

export const mapPaymentStatus = (payment) => ({
  orderId: payment.orderId,
  method: payment.method,
  status: payment.status,
  amount: payment.amount,
  transactionId: payment.transactionId,
  paidAt: payment.paidAt,
});

export const reconcilePaymentState = ({ order, payment }) => ({
  orderId: order?._id ?? order?.id ?? null,
  orderPaymentStatus: order?.paymentStatus ?? "pending",
  paymentStatus: payment?.status ?? "pending",
  isConsistent:
    (order?.paymentStatus ?? "pending") ===
    (payment?.status === "success" ? "paid" : payment?.status ?? "pending"),
});

export const buildRefundPayload = ({
  orderId,
  amount,
  reason = "Order cancelled",
  type = "full_refund",
}) => ({
  orderId,
  refundAmount: amount,
  refundReason: reason,
  refundType: type,
});

// -------------------------
// Payment ledger helpers
// -------------------------

export const createPayment = async (data) => {
  return Payment.create(data);
};

export const updatePayment = async (filter, updateData) => {
  return Payment.findOneAndUpdate(filter, updateData, { new: true });
};

export const findPaymentByOrder = async (orderId) => {
  return Payment.findOne({ orderId });
};

export const findPaymentByTransaction = async (transactionId) => {
  return Payment.findOne({ transactionId });
};

export const markPaymentPaid = async (orderId, payload) => {
  const payment = await findPaymentByOrder(orderId);
  if (!payment) return null;

  const transactionId =
    payload && payload.transactionId
      ? payload.transactionId
      : payment.transactionId;

  const gatewaySignature =
    payload && payload.gatewaySignature !== undefined && payload.gatewaySignature !== null
      ? payload.gatewaySignature
      : payment.gatewaySignature !== undefined && payment.gatewaySignature !== null
        ? payment.gatewaySignature
        : null;

  return Payment.findOneAndUpdate(
    { orderId: orderId },
    {
      status: "paid",
      transactionId: transactionId,
      gatewaySignature: gatewaySignature,
      paidAt: new Date(),
    },
    { new: true },
  );
};

export const markPaymentFailed = async (orderId, reason) => {
  const payment = await findPaymentByOrder(orderId);
  if (!payment) return null;

  return Payment.findOneAndUpdate(
    { orderId: orderId },
    {
      status: "failed",
      failureReason: reason ?? null,
    },
    { new: true },
  );
};
