import axiosInstance from "./axiosInstance";

// Flatten image/gallery from {url,publicId} objects to plain strings so all
// display components continue to receive string URLs without any changes.
// galleryRaw preserves {url,publicId} objects for the organizer management panel.
const normalizeEvent = (ev) => {
  if (!ev) return ev;
  const galleryRaw = (ev.gallery || []).filter((g) => g && (g.url || typeof g === "string"));
  return {
    ...ev,
    id: ev._id || ev.id,
    image: ev.image?.url ?? ev.image ?? "",
    galleryRaw,
    gallery: galleryRaw.map((g) => (g?.url ?? g) || "").filter(Boolean),
  };
};

// Build per-request config for FormData uploads (lets axios set the correct
// multipart boundary and optionally tracks upload progress).
const formDataConfig = (onUploadProgress) => ({
  headers: { "Content-Type": undefined },
  ...(onUploadProgress && {
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        onUploadProgress(
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );
      }
    },
  }),
});

export const getStats = async () => {
  const response = await axiosInstance.get("/stats");
  return response.data;
};

export const getEvents = async (params = {}) => {
  const response = await axiosInstance.get("/events", { params });
  const payload = response.data;
  const events = (payload.data?.events || []).map(normalizeEvent);
  return { data: events, total: payload.data?.total || 0 };
};

export const getEventById = async (id) => {
  const response = await axiosInstance.get(`/events/${id}`);
  const payload = response.data;
  if (payload && payload.event) {
    payload.event = normalizeEvent(payload.event);
  }
  return { success: payload.success, event: payload.event };
};

export const createEvent = async (eventData, onUploadProgress) => {
  try {
    const isFormData = eventData instanceof FormData;
    const response = await axiosInstance.post(
      "/events",
      eventData,
      isFormData ? formDataConfig(onUploadProgress) : {}
    );
    return { success: true, ...response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to create event";
    return { success: false, message: errorMessage, error: error.response?.data || error };
  }
};

export const getMyEvents = async () => {
  const response = await axiosInstance.get("/organizer/events");
  const payload = response.data;
  const events = (payload.events || []).map(normalizeEvent);
  return { data: events };
};

export const updateEvent = async (id, eventData, onUploadProgress) => {
  try {
    const isFormData = eventData instanceof FormData;
    const response = await axiosInstance.put(
      `/events/${id}`,
      eventData,
      isFormData ? formDataConfig(onUploadProgress) : {}
    );
    return { success: true, ...response.data };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to update event";
    return { success: false, message: errorMessage, error: error.response?.data || error };
  }
};

export const deleteEvent = async (id) => {
  const response = await axiosInstance.delete(`/events/${id}`);
  return response.data;
};

export const updateEventStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/events/${id}/status`, { status });
  return response.data;
};

export const addGalleryImages = async (id, files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("gallery", file));
  try {
    const response = await axiosInstance.post(
      `/events/${id}/gallery`,
      formData,
      formDataConfig(onUploadProgress)
    );
    return { success: true, event: normalizeEvent(response.data?.event) };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to upload images." };
  }
};

export const removeGalleryImage = async (id, publicId) => {
  try {
    const response = await axiosInstance.delete(`/events/${id}/gallery`, { data: { publicId } });
    return { success: true, event: normalizeEvent(response.data?.event) };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to remove image." };
  }
};
