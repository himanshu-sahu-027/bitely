import api from "../api/axios";

export async function fetchProfile() {
  const response = await api.get("/api/user/me");
  return response.data;
}

export async function updateProfile(payload) {
  const response = await api.put("/api/user/update-profile", payload);
  return response.data;
}

export async function deleteCurrentUser() {
  const response = await api.delete("/api/user/me");
  return response.data;
}

export async function fetchAddresses() {
  const response = await api.get("/api/user/address");
  return response.data;
}

export async function createAddress(payload) {
  const response = await api.post("/api/user/address", payload);
  return response.data;
}

export async function updateAddress(addressId, payload) {
  const response = await api.put(`/api/user/address/${addressId}`, payload);
  return response.data;
}

export async function deleteAddress(addressId) {
  const response = await api.delete(`/api/user/address/${addressId}`);
  return response.data;
}

export async function saveUserLocation(payload) {
  const response = await api.post("/api/user/location", payload);
  return response.data;
}
