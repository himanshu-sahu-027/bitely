import axios from "axios";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createId = (prefix) => `${prefix}_${Date.now()}`;

// This client is ready for future real API wiring, but the current checkout
// stays on dummy simulation until you intentionally connect frontend to backend.
export const dummyPaymentApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 10000,
});

export async function dummyCreatePaymentOrder(payload) {
  await wait(800);

  const orderId = createId("bitely_order");
  const razorpayOrderId =
    payload.paymentMethod === "ONLINE" ? createId("order_dummy") : null;

  return {
    success: true,
    message:
      payload.paymentMethod === "COD"
        ? "Dummy COD order created"
        : "Dummy online payment order created",
    data: {
      order: {
        id: orderId,
        user: payload.user || "dummy-user",
        items: payload.items,
        totalAmount: payload.totalAmount,
        paymentMethod: payload.paymentMethod,
        paymentStatus: payload.paymentMethod === "COD" ? "pending" : "created",
        deliveryAddress: payload.deliveryAddress,
        orderStatus: "placed",
        razorpayOrderId,
      },
      razorpayOrder:
        payload.paymentMethod === "ONLINE"
          ? {
              id: razorpayOrderId,
              amount: Math.round(payload.totalAmount * 100),
              currency: "INR",
            }
          : null,
      keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_dummy_key",
      mode: "dummy",
    },
  };
}

export async function dummyVerifyPayment({
  orderId,
  razorpayOrderId,
  simulateFailure = false,
}) {
  await wait(900);

  if (simulateFailure) {
    throw new Error("Dummy payment failed. Please try again.");
  }

  return {
    success: true,
    message: "Dummy payment verified successfully",
    data: {
      order: {
        id: orderId,
        paymentStatus: "paid",
        orderStatus: "placed",
        razorpayOrderId,
        razorpayPaymentId: createId("pay_dummy"),
      },
      isSignatureValid: true,
    },
  };
}

export function buildDummyRazorpayResponse(razorpayOrderId) {
  return {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: createId("pay_dummy"),
    razorpay_signature: createId("signature_dummy"),
  };
}
