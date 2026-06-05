import axiosInstance from "./axiosInstance";

// ══════════════════════════════════════════════════════════════════════════════
// ABOUT (singleton)
// ══════════════════════════════════════════════════════════════════════════════
export const adminGetAbout       = async () => { const r = await axiosInstance.get("/admin/content/about"); return r.data.about || {}; };
export const adminUpdateAbout    = async (data) => { const r = await axiosInstance.put("/admin/content/about", data); return r.data.about; };

// ══════════════════════════════════════════════════════════════════════════════
// CAREERS
// ══════════════════════════════════════════════════════════════════════════════
export const adminGetCareers     = async () => { const r = await axiosInstance.get("/admin/content/careers"); return r.data.careers || []; };
export const adminCreateCareer   = async (data) => { const r = await axiosInstance.post("/admin/content/careers", data); return r.data; };
export const adminUpdateCareer   = async (id, data) => { const r = await axiosInstance.put(`/admin/content/careers/${id}`, data); return r.data.career; };
export const adminDeleteCareer   = async (id) => axiosInstance.delete(`/admin/content/careers/${id}`);

// ══════════════════════════════════════════════════════════════════════════════
// BLOG POSTS
// ══════════════════════════════════════════════════════════════════════════════
export const adminGetBlogPosts   = async () => { const r = await axiosInstance.get("/admin/content/blog-posts"); return r.data.posts || []; };
export const adminCreateBlogPost = async (data) => { const r = await axiosInstance.post("/admin/content/blog-posts", data); return r.data; };
export const adminUpdateBlogPost = async (id, data) => { const r = await axiosInstance.put(`/admin/content/blog-posts/${id}`, data); return r.data.post; };
export const adminDeleteBlogPost = async (id) => axiosInstance.delete(`/admin/content/blog-posts/${id}`);

// ══════════════════════════════════════════════════════════════════════════════
// PRESS ITEMS
// ══════════════════════════════════════════════════════════════════════════════
export const adminGetPressItems   = async () => { const r = await axiosInstance.get("/admin/content/press-items"); return r.data.press || []; };
export const adminCreatePressItem = async (data) => { const r = await axiosInstance.post("/admin/content/press-items", data); return r.data; };
export const adminUpdatePressItem = async (id, data) => { const r = await axiosInstance.put(`/admin/content/press-items/${id}`, data); return r.data.pressItem; };
export const adminDeletePressItem = async (id) => axiosInstance.delete(`/admin/content/press-items/${id}`);

// ══════════════════════════════════════════════════════════════════════════════
// HELP FAQs
// ══════════════════════════════════════════════════════════════════════════════
export const adminGetFAQs     = async () => { const r = await axiosInstance.get("/admin/content/help-faqs"); return r.data.faqs || []; };
export const adminCreateFAQ   = async (data) => { const r = await axiosInstance.post("/admin/content/help-faqs", data); return r.data; };
export const adminUpdateFAQ   = async (id, data) => { const r = await axiosInstance.put(`/admin/content/help-faqs/${id}`, data); return r.data.faq; };
export const adminDeleteFAQ   = async (id) => axiosInstance.delete(`/admin/content/help-faqs/${id}`);

// ══════════════════════════════════════════════════════════════════════════════
// CONTACT INFO (singleton)
// ══════════════════════════════════════════════════════════════════════════════
export const adminGetContactInfo    = async () => { const r = await axiosInstance.get("/admin/content/contact-info"); return r.data.contactInfo || {}; };
export const adminUpdateContactInfo = async (data) => { const r = await axiosInstance.put("/admin/content/contact-info", data); return r.data.contactInfo; };

// ══════════════════════════════════════════════════════════════════════════════
// SUBMISSIONS — ENQUIRIES
// ══════════════════════════════════════════════════════════════════════════════
export const adminGetEnquiries         = async () => { const r = await axiosInstance.get("/admin/submissions/enquiries"); return r.data.enquiries || []; };
export const adminUpdateEnquiryStatus  = async (id, status) => axiosInstance.patch(`/admin/submissions/enquiries/${id}/status`, { status });
export const adminDeleteEnquiry        = async (id) => axiosInstance.delete(`/admin/submissions/enquiries/${id}`);

// ══════════════════════════════════════════════════════════════════════════════
// SUBMISSIONS — REPORTS
// ══════════════════════════════════════════════════════════════════════════════
export const adminGetReports        = async () => { const r = await axiosInstance.get("/admin/submissions/reports"); return r.data.reports || []; };
export const adminUpdateReportStatus = async (id, status) => axiosInstance.patch(`/admin/submissions/reports/${id}/status`, { status });
export const adminDeleteReport      = async (id) => axiosInstance.delete(`/admin/submissions/reports/${id}`);
