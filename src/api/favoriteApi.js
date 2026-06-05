import axiosInstance from "./axiosInstance";

export const toggleFavorite = async (eventId) => {
  const res = await axiosInstance.post(`/favorites/${eventId}`);
  return res.data;
};

export const getUserFavorites = async () => {
  const res = await axiosInstance.get("/favorites");
  return res.data;
};

export const getFavoriteIds = async () => {
  const res = await axiosInstance.get("/favorites/ids");
  return res.data;
};

export const getFavoriteStatus = async (eventId) => {
  const res = await axiosInstance.get(`/favorites/status/${eventId}`);
  return res.data;
};
