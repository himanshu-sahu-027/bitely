import crypto from "crypto";

export const createDummyRazorpayOrder = ({ amount, receipt }) => {
  const timestamp = Date.now();

  return {
    id: `order_dummy_${timestamp}`,
    entity: "order",
    amount,
    amount_paid: 0,
    amount_due: amount,
    currency: "INR",
    receipt,
    status: "created",
  };
};

export const createDummyPaymentVerification = ({ razorpayOrderId }) => {
  const razorpayPaymentId = `pay_dummy_${Date.now()}`;
  const secret = "dummy_signature_secret";
  const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
  const razorpaySignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return {
    razorpayPaymentId,
    razorpaySignature,
    secret,
  };
};
