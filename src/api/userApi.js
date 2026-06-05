import axiosInstance from "./axiosInstance";

export const getUsers = async (params = {}) => {
  const response = await axiosInstance.get("/admin/users", { params });
  return response.data;
};

export const updateUserStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/admin/users/${id}/status`, { status });
  return response.data;
};
