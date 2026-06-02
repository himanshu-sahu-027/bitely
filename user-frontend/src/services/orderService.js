import api from "../api/axios";

export async function fetchOrders(params = {}) {
  const response = await api.get("/api/orders", { params });
  return response.data;
}

export async function fetchActiveOrders(params = {}) {
  const response = await api.get("/api/orders/active", { params });
  return response.data;
}

export async function fetchOrderHistory(params = {}) {
  const response = await api.get("/api/orders/history", { params });
  return response.data;
}

export async function fetchOrderById(orderId) {
  const response = await api.get(`/api/orders/${orderId}`);
  return response.data;
}

export async function createOrder(payload) {
  const response = await api.post("/api/orders", payload);
  return response.data;
}

export async function cancelOrder(orderId) {
  const response = await api.post(`/api/orders/${orderId}/cancel`);
  return response.data;
}

export async function reorderOrder(orderId) {
  const response = await api.post(`/api/orders/${orderId}/reorder`);
  return response.data;
}
