import axiosInstance from "./axiosInstance";

export const login = async (credentials) => {
  const response = await axiosInstance.post("/login", credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await axiosInstance.post("/register", userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await axiosInstance.get("/me");
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/logout");
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post("/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await axiosInstance.post(`/reset-password/${token}`, { password });
  return response.data;
};

export const sendOtp = async (email, type) => {
  const response = await axiosInstance.post("/otp/send", { email, type });
  return response.data;
};

export const verifyOtp = async (email, code, type) => {
  const response = await axiosInstance.post("/otp/verify", { email, code, type });
  return response.data;
};

export const resetPasswordViaOtp = async (email, newPassword) => {
  const response = await axiosInstance.post("/reset-password-otp", { email, newPassword });
  return response.data;
};
