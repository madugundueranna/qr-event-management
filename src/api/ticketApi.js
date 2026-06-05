import axiosInstance from "./axiosInstance";

export const bookTicket = async (ticketData) => {
  const response = await axiosInstance.post("/tickets", ticketData);
  return response.data;
};

export const getMyTickets = async () => {
  const response = await axiosInstance.get("/tickets/my");
  return response.data;
};

export const checkInTicket = async (ticketId) => {
  const response = await axiosInstance.patch(`/tickets/${ticketId}/checkin`);
  return response.data;
};

export const getEventTickets = async (eventId) => {
  const response = await axiosInstance.get(`/events/${eventId}/tickets`);
  return response.data;
};

// ─── Scan Check-In ───────────────────────────────────────────────────────────
export const scanTicket = async (scanToken) => {
  const response = await axiosInstance.post("/tickets/scan", { scanToken });
  return response.data;
};

// ─── Razorpay Payment ─────────────────────────────────────────────────────────

export const createPaymentOrder = async (data) => {
  const response = await axiosInstance.post("/payment/create-order", data);
  return response.data;
};

export const verifyPayment = async (data) => {
  const response = await axiosInstance.post("/payment/verify", data);
  return response.data;
};
