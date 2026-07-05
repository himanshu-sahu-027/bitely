import api from "../api/axios";

// send otp and verify otp are dead code ---> we have to remove them from here and use the backend service instead.
export async function sendOtp(payload) {
  const response = await api.post("/api/auth/send-otp", payload);
  return response.data;
}

export async function verifyOtp(payload) {
  const response = await api.post("/api/auth/verify-otp", payload);
  return response.data;
}

// Phase 3/4 production-style auth
export async function registerUser(payload) {
  const response = await api.post("/api/auth/register", payload);
  return response.data;
}

export async function verifyEmail(payload) {
  const response = await api.post("/api/auth/verify-email", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
}

export async function googleSignIn(payload) {
  const response = await api.post("/api/auth/google", payload);
  return response.data;
}

export async function forgotPassword(payload) {
  const response = await api.post("/api/auth/forgot-password", payload);
  return response.data;
}

export async function resetPassword(payload) {
  const response = await api.post("/api/auth/reset-password", payload);
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

