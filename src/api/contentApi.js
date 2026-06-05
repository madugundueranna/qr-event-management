import axiosInstance from "./axiosInstance";

export const getAboutContent = async () => {
  const res = await axiosInstance.get("/about-content");
  return res.data.about || {};
};

export const getCareers = async () => {
  const res = await axiosInstance.get("/careers");
  return res.data.careers || [];
};

export const getBlogPosts = async () => {
  const res = await axiosInstance.get("/blog-posts");
  return res.data.posts || [];
};

export const getBlogPostBySlug = async (slug) => {
  const res = await axiosInstance.get(`/blog-posts/${slug}`);
  return res.data.post || null;
};

export const getPressItems = async () => {
  const res = await axiosInstance.get("/press-items");
  return res.data.press || [];
};

export const getHelpFAQs = async () => {
  const res = await axiosInstance.get("/help-faqs");
  return res.data.faqs || [];
};

export const getContactInfo = async () => {
  const res = await axiosInstance.get("/contact-info");
  return res.data.contactInfo || {};
};
