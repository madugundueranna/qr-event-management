import axiosInstance from "./axiosInstance";

export const submitContactEnquiry = async ({ name, email, message }) => {
  const res = await axiosInstance.post("/contact", { name, email, message });
  return res.data;
};

export const submitReportIssue = async (formData) => {
  const res = await axiosInstance.post("/report-issue", formData, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
};
