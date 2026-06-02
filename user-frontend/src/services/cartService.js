import api from "../api/axios";

export async function fetchCart() {
  const response = await api.get("/api/cart");
  return response.data;
}

export async function addCartItem(payload) {
  const response = await api.post("/api/cart/items", payload);
  return response.data;
}

export async function updateCartItem(menuId, payload) {
  const response = await api.put(`/api/cart/items/${menuId}`, payload);
  return response.data;
}

export async function removeCartItem(menuId) {
  const response = await api.delete(`/api/cart/items/${menuId}`);
  return response.data;
}

export async function applyCartCoupon(payload) {
  const response = await api.post("/api/cart/coupon", payload);
  return response.data;
}

export async function removeCartCoupon() {
  const response = await api.delete("/api/cart/coupon");
  return response.data;
}

export async function clearCartRequest() {
  const response = await api.delete("/api/cart");
  return response.data;
}
