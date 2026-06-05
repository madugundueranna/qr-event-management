import axiosInstance from "./axiosInstance";

// ─── Cities ───────────────────────────────────────────────────────────────────

export const getCities = async () => {
  const res = await axiosInstance.get("/cities");
  return res.data;
};

export const createCity = async (name) => {
  const res = await axiosInstance.post("/cities", { name });
  return res.data;
};

export const updateCity = async (id, name) => {
  const res = await axiosInstance.put(`/cities/${id}`, { name });
  return res.data;
};

export const deleteCity = async (id) => {
  const res = await axiosInstance.delete(`/cities/${id}`);
  return res.data;
};

// ─── Event Categories ─────────────────────────────────────────────────────────

// Public — active categories only (for filter dropdowns & create-event form)
export const getEventCategories = async () => {
  const res = await axiosInstance.get("/event-categories");
  return res.data;
};

// Admin — all categories including inactive (for the admin management page)
export const getAdminEventCategories = async () => {
  const res = await axiosInstance.get("/event-categories/all");
  return res.data;
};

export const createEventCategory = async (name) => {
  const res = await axiosInstance.post("/event-categories", { name });
  return res.data;
};

export const updateEventCategory = async (id, name) => {
  const res = await axiosInstance.put(`/event-categories/${id}`, { name });
  return res.data;
};

export const toggleEventCategory = async (id) => {
  const res = await axiosInstance.patch(`/event-categories/${id}/toggle`);
  return res.data;
};

export const deleteEventCategory = async (id) => {
  const res = await axiosInstance.delete(`/event-categories/${id}`);
  return res.data;
};
