import api from "../api/axios";

export async function createPaymentOrder(payload) {
  const response = await api.post("/api/payment/create-order", payload);
  return response.data;
}

export async function verifyPayment(payload) {
  const response = await api.post("/api/payment/verify-payment", payload);
  return response.data;
}
