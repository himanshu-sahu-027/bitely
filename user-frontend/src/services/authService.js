import api from "../api/axios";

export async function sendOtp(payload) {
  const response = await api.post("/api/auth/send-otp", payload);
  return response.data;
}

export async function verifyOtp(payload) {
  const response = await api.post("/api/auth/verify-otp", payload);
  return response.data;
}

export async function logoutUser() {
  const response = await api.post("/api/auth/logout");
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/api/user/me");
  return response.data;
}

export async function updateCurrentUser(payload) {
  const response = await api.put("/api/user/update-profile", payload);
  return response.data;
}
