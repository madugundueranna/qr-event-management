// src/pages/seller/AddProperty.jsx  →  Show All Errors at Top When Publish Clicked

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createEvent } from "../../api/eventApi";
import { getCities, getEventCategories } from "../../api/categoryApi";
import {
  CheckCircle,
  CloudUpload,
  Notifications,
  KeyboardArrowDown,
  Add,
  Close,
  Image,
  ErrorOutlined,
  QrCode2,
  Campaign,
  VerifiedUser,
  QrCodeScanner,
  Lock,
  PhotoCamera,
} from "@mui/icons-material";
import Button from "../../components/common/Button";

const STEPS = [
  { num: 1, label: "Event Details", sub: "Basic Information" },
  { num: 2, label: "Media & Visuals", sub: "Banner & Photos" },
  { num: 3, label: "Venue & Tickets", sub: "Location & Pricing" },
  { num: 4, label: "Review & Publish", sub: "Final Submission" },
];

const TIMES = [
  "Morning (9-12)",
  "Afternoon (12-4)",
  "Evening (4-7)",
  "Night (8-11)",
];
const TIERS = ["Free", "General", "VIP", "Early Bird", "Group Package"];
const PERKS_LIST = [
  "Wi-Fi",
  "Parking",
  "Lunch Included",
  "Certificate",
  "Networking",
  "Kit Bag",
  "VIP Lounge",
  "Food Courts",
  "Live Streaming",
];

// Error Alert Component
const ErrorAlert = ({ type, title, message, details, onClose }) => {
  const errorStyles = {
    validation: {
      bg: "bg-red-50",
      border: "border-l-4 border-red-500",
      icon: <ErrorOutlined className="text-red-500" style={{ fontSize: 24 }} />,
      titleColor: "text-red-900",
      textColor: "text-red-700",
      buttonBg: "hover:bg-red-100",
    },
    upload: {
      bg: "bg-amber-50",
      border: "border-l-4 border-amber-500",
      icon: <ErrorOutlined className="text-amber-500" style={{ fontSize: 24 }} />,
      titleColor: "text-amber-900",
      textColor: "text-amber-700",
      buttonBg: "hover:bg-amber-100",
    },
    api: {
      bg: "bg-red-50",
      border: "border-l-4 border-red-500",
      icon: <Close className="text-red-500" style={{ fontSize: 24 }} />,
      titleColor: "text-red-900",
      textColor: "text-red-700",
      buttonBg: "hover:bg-red-100",
    },
    success: {
      bg: "bg-green-50",
      border: "border-l-4 border-green-500",
      icon: <CheckCircle className="text-green-500" style={{ fontSize: 24 }} />,
      titleColor: "text-green-900",
      textColor: "text-green-700",
      buttonBg: "hover:bg-green-100",
    },
  };

  const style = errorStyles[type];

  return (
    <div
      className={`rounded-lg ${style.bg} p-4 ${style.border} shadow-md animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 flex items-start pt-0.5">
          {style.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-sm ${style.titleColor}`}>{title}</h3>
          <p className={`text-sm mt-2 ${style.textColor}`}>{message}</p>

          {details && details.length > 0 && (
            <ul className={`mt-3 ml-4 space-y-1.5 text-sm ${style.textColor}`}>
              {details.map((detail, idx) => (
                <li key={idx} className="list-disc font-semibold">
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${style.buttonBg} rounded-lg p-1 transition`}
          >
            <Close style={{ fontSize: 20 }} />
          </button>
        )}
      </div>
    </div>
  );
};

// Field Error Component
const FieldError = ({ error }) => {
  if (!error) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 font-semibold">
      <ErrorOutlined style={{ fontSize: 14 }} />
      {error}
    </p>
  );
};

export default function AddProperty() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const [step, setStep] = useState(0);
  const [selectedPerks, setSelectedPerks] = useState([]);
  const [tiers, setTiers] = useState([{ label: "", price: "" }]);
  const [tierErrors, setTierErrors] = useState([{}]);

  // Image State
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [bannerError, setBannerError] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryError, setGalleryError] = useState("");

  // Dynamic cities & categories from API
  const [cityOptions, setCityOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    getCities().then((res) => setCityOptions(res.cities || [])).catch(() => {});
    getEventCategories().then((res) => setCategoryOptions(res.categories || [])).catch(() => {});
  }, []);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [expectedRegistrations, setExpectedRegistrations] = useState("");
  const [description, setDescription] = useState("");

  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [pincode, setPincode] = useState("");

  const [organizerName, setOrganizerName] = useState(user?.name || "");
  const [organizerMobile, setOrganizerMobile] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState(user?.email || "");
  const [organizerBestTime, setOrganizerBestTime] = useState("");

  const [agreement, setAgreement] = useState(false);

  // Error & Alert State
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("");
  const [errorDetails, setErrorDetails] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper function to show error
  const showError = (type, message, details = []) => {
    setError(message);
    setErrorType(type);
    setErrorDetails(details);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper function to clear error
  const clearError = () => {
    setError("");
    setErrorType("");
    setErrorDetails([]);
  };

  // Returns the error message string for a field, or null if valid.
  // Does NOT touch React state — callers decide when to setFieldErrors.
  const getFieldError = (fieldName, value, currentStartTime, currentCapacity) => {
    switch (fieldName) {
      case "title":
        if (!value || value.trim() === "") return "Event title is required";
        if (value.length < 5) return "Event title must be at least 5 characters";
        return null;

      case "category":
        if (!value) return "Category is required";
        return null;

      case "date":
        if (!value) return "Event date is required";
        return null;

      case "startTime":
        if (!value) return "Start time is required";
        return null;

      case "endTime":
        if (value && currentStartTime && value <= currentStartTime)
          return "End time must be after start time";
        return null;

      case "capacity":
        if (!value) return "Total capacity is required";
        if (isNaN(value) || Number(value) <= 0) return "Capacity must be a positive number";
        return null;

      case "expectedRegistrations":
        if (value && (isNaN(value) || Number(value) < 0)) return "Must be a positive number";
        if (value && currentCapacity && Number(value) > Number(currentCapacity))
          return "Cannot exceed total capacity";
        return null;

      case "description":
        if (!value || value.trim() === "") return "Event description is required";
        if (value.length < 20) return "Description must be at least 20 characters";
        return null;

      case "venueName":
        if (!value || value.trim() === "") return "Venue name is required";
        return null;

      case "city":
        if (!value) return "City is required";
        return null;

      case "address":
        if (!value || value.trim() === "") return "Venue address is required";
        return null;

      case "googleMapsLink":
        if (value && !value.startsWith("http://") && !value.startsWith("https://"))
          return "Must be a valid URL";
        return null;

      case "pincode":
        if (value && !/^\d{4,6}$/.test(value)) return "Pincode must be 4-6 digits";
        return null;

      case "organizerName":
        if (!value || value.trim() === "") return "Organizer name is required";
        return null;

      case "organizerMobile":
        if (!value || value.trim() === "") return "Mobile number is required";
        if (!/^\d{10}$/.test(value.replace(/\D/g, ""))) return "Mobile number must be 10 digits";
        return null;

      case "organizerEmail":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email";
        return null;

      default:
        return null;
    }
  };

  // Validates a single field on blur/change and updates fieldErrors state
  const validateField = (fieldName, value) => {
    const errorMsg = getFieldError(fieldName, value, startTime, capacity);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) {
        next[fieldName] = errorMsg;
      } else {
        delete next[fieldName];
      }
      return next;
    });
    return !errorMsg;
  };

  // Handle field blur
  const handleFieldBlur = (fieldName, value) => {
    validateField(fieldName, value);
  };

  // Banner Image Upload Handler
  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();

    const maxSize = 5 * 1024 * 1024;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      showError("upload", "Invalid Banner Format", [
        "Only JPG, PNG, and WebP formats are supported",
      ]);
      return;
    }

    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      showError("upload", "Banner File Too Large", [
        `File size is ${sizeMB}MB (max 5MB allowed)`,
      ]);
      return;
    }

    setBannerError("");
    setBannerImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Gallery Images Upload Handler
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    clearError();
    setGalleryError("");

    const maxSize = 5 * 1024 * 1024;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxFiles = 10;

    if (galleryImages.length + files.length > maxFiles) {
      setGalleryError(`Maximum ${maxFiles} images allowed. You already have ${galleryImages.length}.`);
      return;
    }

    const validFiles = [];
    const invalidFiles = [];

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} — invalid format`);
        continue;
      }
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        invalidFiles.push(`${file.name} — too large (${sizeMB}MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (invalidFiles.length > 0) {
      setGalleryError(`Rejected: ${invalidFiles.join(", ")}`);
      return;
    }

    setGalleryError("");
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImages((prev) => [...prev, file]);
        setGalleryPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove Gallery Image
  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    setGalleryError("");
  };

  const togglePerk = (p) => {
    setSelectedPerks((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const getTierRowErrors = (tier) => {
    const errs = {};
    if (!tier.label) errs.label = "Tier type is required";
    if (tier.label === "Free" && tier.price !== "" && Number(tier.price) > 0) {
      errs.price = "Free tier must have price ₹0";
    } else if (tier.price !== "" && (isNaN(tier.price) || Number(tier.price) < 0)) {
      errs.price = "Price must be ₹0 or greater";
    }
    return errs;
  };

  const updateTierField = (index, field, value) => {
    // Auto-zero price when switching to Free
    const autoPrice = field === "label" && value === "Free" ? "0" : undefined;
    setTiers((t) =>
      t.map((x, idx) =>
        idx === index
          ? { ...x, [field]: value, ...(autoPrice !== undefined ? { price: autoPrice } : {}) }
          : x
      )
    );
    setTierErrors((prev) => {
      const next = [...prev];
      const tier = {
        ...tiers[index],
        [field]: value,
        ...(autoPrice !== undefined ? { price: autoPrice } : {}),
      };
      next[index] = getTierRowErrors(tier);
      return next;
    });
  };

  const addTier = () => {
    setTiers((t) => [...t, { label: "", price: "" }]);
    setTierErrors((e) => [...e, {}]);
  };

  const removeTier = (i) => {
    setTiers((t) => t.filter((_, idx) => idx !== i));
    setTierErrors((e) => e.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validate all required fields
    const fieldsToValidate = [
      "title",
      "category",
      "date",
      "startTime",
      "capacity",
      "venueName",
      "city",
      "address",
      "description",
      "organizerName",
      "organizerMobile",
    ];

    const fieldValues = {
      title, category, date, startTime, capacity,
      venueName, city, address, description, organizerName, organizerMobile,
    };

    const fieldLabels = {
      title: "Event Title",
      category: "Category",
      date: "Event Date",
      startTime: "Start Time",
      capacity: "Total Capacity",
      description: "Event Description",
      venueName: "Venue Name",
      city: "City",
      address: "Full Venue Address",
      organizerName: "Organizer Name",
      organizerMobile: "Mobile Number",
    };

    // Collect all errors synchronously without relying on stale state
    const newErrors = {};
    const allErrorMessages = [];

    fieldsToValidate.forEach((field) => {
      const errorMsg = getFieldError(field, fieldValues[field], startTime, capacity);
      if (errorMsg) {
        newErrors[field] = errorMsg;
        allErrorMessages.push(`${fieldLabels[field] || field}: ${errorMsg}`);
      }
    });

    // Validate banner image
    if (!bannerImagePreview) {
      setBannerError("Event banner image is required");
    }

    // Validate ticket tiers
    const newTierErrors = tiers.map((tier) => getTierRowErrors(tier));
    const hasTierErrors = newTierErrors.some((e) => Object.keys(e).length > 0);
    if (hasTierErrors) setTierErrors(newTierErrors);

    // Push new errors into state so red borders + inline messages appear on fields
    if (allErrorMessages.length > 0 || !bannerImagePreview || hasTierErrors) {
      setFieldErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    if (!agreement) {
      showError("api", "Agreement Required", [
        "You must confirm that all details are accurate before publishing",
      ]);
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    // Build multipart FormData — send actual File objects, not base64 strings
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", category);
    formData.append("tag", "New");
    formData.append("city", city);
    formData.append("location", `${venueName}, ${city}`);
    formData.append("venue", venueName);
    formData.append("address", address);
    formData.append("pincode", pincode || "");
    formData.append("googleMapsLink", googleMapsLink || "");
    formData.append("date", date);
    formData.append("time", startTime);
    formData.append("endTime", endTime || "");
    formData.append("price", String(tiers[0] ? Number(tiers[0].price) || 0 : 0));
    formData.append("capacity", String(Number(capacity)));
    formData.append("expectedRegistrations", String(Number(expectedRegistrations) || 0));
    formData.append("description", description);

    // Amenities as multiple values so multer gets an array
    selectedPerks.forEach((perk) => formData.append("amenities", perk));

    // Tiers and contact as JSON strings (parsed server-side)
    formData.append(
      "tiers",
      JSON.stringify(tiers.map((t) => ({ label: t.label, price: Number(t.price) || 0 })))
    );
    formData.append(
      "organizerContact",
      JSON.stringify({
        name: organizerName,
        mobile: organizerMobile,
        email: organizerEmail,
        bestTime: organizerBestTime,
      })
    );

    // Attach actual File objects — Cloudinary upload happens on the server
    if (bannerImage) formData.append("image", bannerImage);
    galleryImages.forEach((file) => formData.append("gallery", file));

    try {
      const res = await createEvent(formData, (pct) => setUploadProgress(pct));
      if (res.success) {
        showError("success", "Event Published Successfully", [
          `"${title}" has been published`,
        ]);
        setTimeout(() => {
          navigate("/organizer/dashboard");
        }, 1500);
      } else {
        const errorMsg =
          res.message ||
          res.error?.message ||
          "Failed to create event. Please try again.";
        showError("api", "Failed to Publish Event", [errorMsg]);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred";
      showError("api", "Connection Error", [errorMsg]);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg">
            Q
          </div>
          <div>
            <p className="text-xs font-black leading-none tracking-[0.2em] text-ink-900">
              QREventix
            </p>
            <p className="text-[8px] tracking-[0.35em] text-slate-400">
              ORGANIZER PORTAL
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
            <Notifications style={{ fontSize: 20 }} />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
              1
            </span>
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-ink-900">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400">
                  {user?.companyName || "Organizer"}
                </p>
              </div>
              <KeyboardArrowDown className="text-slate-400" style={{ fontSize: 16 }} />
            </button>
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1 hidden group-hover:block z-[99]">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold disabled:opacity-50"
              >
                {loggingOut ? "Logging out…" : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-page py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-ink-900">
              Create New Event
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Fill in the details to publish your event. Fields marked{" "}
              <span className="text-red-600 font-bold">*</span> are mandatory.
            </p>
          </div>
          <Link
            to="/organizer/dashboard"
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stepper */}
        <div className="mb-6 glass-card px-6 py-4">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold ${
                      i === step
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : i < step
                          ? "border-indigo-300 bg-indigo-100 text-indigo-600"
                          : "border-slate-300 bg-white text-slate-400"
                    }`}
                  >
                    {i < step ? <CheckCircle style={{ fontSize: 18 }} /> : s.num}
                  </div>
                  <p
                    className={`text-[11px] font-bold ${i === step ? "text-indigo-600" : "text-slate-400"}`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[9px] text-slate-400">{s.sub}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${i < step ? "bg-indigo-300" : "bg-slate-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert - Shows upload errors, API errors, and success only */}
          {error && errorType !== "validation" && (
            <ErrorAlert
              type={errorType}
              title={
                errorType === "upload"
                  ? "Upload Error"
                  : errorType === "api"
                    ? "Server Error"
                    : "Success"
              }
              message={error}
              details={errorDetails}
              onClose={clearError}
            />
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* ── Left Form ── */}
            <div className="space-y-6">
              {/* Section 1: Event Details */}
              <div className="glass-card p-6">
                <h2 className="mb-5 text-base font-black text-indigo-600">
                  1. Event Details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Event Title */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Event Title{" "}
                      <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        fieldErrors.title
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="e.g. Global Tech Summit 2026"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (fieldErrors.title) validateField("title", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("title", e.target.value)}
                    />
                    <FieldError error={fieldErrors.title} />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Category <span className="text-red-600 font-bold">*</span>
                    </label>
                    <select
                      className={`form-select ${
                        fieldErrors.category
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (fieldErrors.category) validateField("category", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("category", e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categoryOptions.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <FieldError error={fieldErrors.category} />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Event Date <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-input ${
                        fieldErrors.date
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (fieldErrors.date) validateField("date", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("date", e.target.value)}
                    />
                    <FieldError error={fieldErrors.date} />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Start Time <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="time"
                      className={`form-input ${
                        fieldErrors.startTime
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        if (fieldErrors.startTime) validateField("startTime", e.target.value);
                        if (endTime) validateField("endTime", endTime);
                      }}
                      onBlur={(e) => handleFieldBlur("startTime", e.target.value)}
                    />
                    <FieldError error={fieldErrors.startTime} />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      End Time
                    </label>
                    <input
                      type="time"
                      className={`form-input ${
                        fieldErrors.endTime
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        validateField("endTime", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("endTime", e.target.value)}
                    />
                    <FieldError error={fieldErrors.endTime} />
                  </div>

                  {/* Total Capacity */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Total Capacity{" "}
                      <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="number"
                      className={`form-input ${
                        fieldErrors.capacity
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="e.g. 500"
                      value={capacity}
                      onChange={(e) => {
                        setCapacity(e.target.value);
                        if (fieldErrors.capacity) validateField("capacity", e.target.value);
                        if (expectedRegistrations) validateField("expectedRegistrations", expectedRegistrations);
                      }}
                      onBlur={(e) => handleFieldBlur("capacity", e.target.value)}
                    />
                    <FieldError error={fieldErrors.capacity} />
                  </div>

                  {/* Expected Registrations */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Expected Registrations
                    </label>
                    <input
                      type="number"
                      className={`form-input ${
                        fieldErrors.expectedRegistrations
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="e.g. 450"
                      value={expectedRegistrations}
                      onChange={(e) => {
                        setExpectedRegistrations(e.target.value);
                        if (fieldErrors.expectedRegistrations) validateField("expectedRegistrations", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("expectedRegistrations", e.target.value)}
                    />
                    <FieldError error={fieldErrors.expectedRegistrations} />
                  </div>

                  {/* Event Description */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Event Description{" "}
                      <span className="text-red-600 font-bold">*</span>
                    </label>
                    <textarea
                      className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none min-h-[100px] focus:ring-2 ${
                        fieldErrors.description
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                      }`}
                      placeholder="Describe your event in detail – agenda, highlights, speakers..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (fieldErrors.description) validateField("description", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("description", e.target.value)}
                    />
                    <FieldError error={fieldErrors.description} />
                  </div>
                </div>
              </div>

              {/* Section 2: Media */}
              <div className="glass-card p-6">
                <h2 className="mb-5 text-base font-black text-indigo-600">
                  2. Event Banner & Media
                </h2>
                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Banner Upload */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Event Banner Image <span className="text-red-600 font-bold">*</span>
                    </label>
                    <p className="mb-3 text-[10px] text-slate-400">
                      JPG/PNG/WebP, max 5MB
                    </p>

                    {bannerImagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-indigo-300 bg-indigo-50">
                        <img
                          src={bannerImagePreview}
                          alt="Banner preview"
                          className="w-full h-48 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBannerImage(null);
                            setBannerImagePreview(null);
                            setBannerError("Event banner image is required");
                          }}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                        >
                          <Close style={{ fontSize: 16 }} />
                        </button>
                        <label className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 cursor-pointer hover:bg-indigo-50">
                          <Image style={{ fontSize: 14 }} /> Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 text-center transition ${bannerError ? "border-red-400 bg-red-50 hover:border-red-500" : "border-indigo-200 bg-indigo-50 hover:border-indigo-400 hover:bg-indigo-100"}`}>
                        <CloudUpload className={bannerError ? "text-red-400" : "text-indigo-400"} style={{ fontSize: 36 }} />
                        <p className={`text-sm font-semibold ${bannerError ? "text-red-600" : "text-indigo-600"}`}>
                          Click to upload banner
                        </p>
                        <p className="text-xs text-slate-400">
                          JPG/PNG/WebP, max 5MB
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleBannerUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    <FieldError error={bannerError} />
                  </div>

                  {/* Gallery Upload */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Additional Gallery Photos
                    </label>
                    <p className="mb-3 text-[10px] text-slate-400">
                      Max 10 images, JPG/PNG/WebP, 5MB each
                    </p>

                    {galleryPreviews.length > 0 ? (
                      <div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {galleryPreviews.map((preview, i) => (
                            <div
                              key={i}
                              className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                            >
                              <img
                                src={preview}
                                alt={`Gallery ${i}`}
                                className="w-full h-24 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(i)}
                                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs hover:bg-red-700 transition"
                              >
                                <Close style={{ fontSize: 12 }} />
                              </button>
                            </div>
                          ))}
                        </div>
                        {galleryImages.length < 10 && (
                          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-center hover:border-indigo-300 hover:bg-indigo-50 transition">
                            <Add className="text-slate-400" style={{ fontSize: 24 }} />
                            <p className="text-xs font-semibold text-slate-600">
                              Add more photos
                            </p>
                            <input
                              type="file"
                              multiple
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleGalleryUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white py-10 text-center hover:border-indigo-300 hover:bg-indigo-50 transition">
                        <CloudUpload className="text-slate-300" style={{ fontSize: 36 }} />
                        <p className="text-sm font-semibold text-slate-500">
                          Upload gallery images
                        </p>
                        <p className="text-xs text-slate-400">
                          Max 10 images
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleGalleryUpload}
                          className="hidden"
                        />
                      </label>
                    )}

                    {galleryImages.length > 0 && (
                      <p className="mt-2 text-xs text-slate-500 font-semibold">
                        <PhotoCamera style={{ fontSize: 14 }} className="mr-1" /> {galleryImages.length}/10 images
                      </p>
                    )}
                    <FieldError error={galleryError} />
                  </div>
                </div>
              </div>

              {/* Section 3: Venue & Tickets */}
              <div className="glass-card p-6">
                <h2 className="mb-5 text-base font-black text-indigo-600">
                  3. Venue & Tickets
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Venue Name */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Venue Name <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        fieldErrors.venueName
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="e.g. KTPO Exhibition Centre"
                      value={venueName}
                      onChange={(e) => {
                        setVenueName(e.target.value);
                        if (fieldErrors.venueName) validateField("venueName", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("venueName", e.target.value)}
                    />
                    <FieldError error={fieldErrors.venueName} />
                  </div>

                  {/* City */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      City <span className="text-red-600 font-bold">*</span>
                    </label>
                    <select
                      className={`form-select ${
                        fieldErrors.city
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        if (fieldErrors.city) validateField("city", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("city", e.target.value)}
                    >
                      <option value="">Select City</option>
                      {cityOptions.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <FieldError error={fieldErrors.city} />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Full Venue Address{" "}
                      <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        fieldErrors.address
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="Street address, landmark..."
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (fieldErrors.address) validateField("address", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("address", e.target.value)}
                    />
                    <FieldError error={fieldErrors.address} />
                  </div>

                  {/* Google Maps Link */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Google Maps Link
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        fieldErrors.googleMapsLink
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="https://maps.google.com/..."
                      value={googleMapsLink}
                      onChange={(e) => {
                        setGoogleMapsLink(e.target.value);
                        if (fieldErrors.googleMapsLink) validateField("googleMapsLink", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("googleMapsLink", e.target.value)}
                    />
                    <FieldError error={fieldErrors.googleMapsLink} />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Pincode
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        fieldErrors.pincode
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="560001"
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value);
                        if (fieldErrors.pincode) validateField("pincode", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("pincode", e.target.value)}
                    />
                    <FieldError error={fieldErrors.pincode} />
                  </div>
                </div>

                {/* Ticket Tiers */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-semibold text-slate-600">
                      Ticket Tiers <span className="text-red-600 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addTier}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      <Add style={{ fontSize: 16 }} /> Add Tier
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tiers.map((tier, i) => {
                      const te = tierErrors[i] || {};
                      return (
                        <div key={i} className="space-y-1">
                          <div
                            className={`flex items-center gap-3 rounded-xl border bg-slate-50 p-3 ${
                              te.label || te.price
                                ? "border-red-300 bg-red-50"
                                : "border-slate-200"
                            }`}
                          >
                            {/* Tier type select */}
                            <div className="flex-1">
                              <select
                                value={tier.label}
                                onChange={(e) => updateTierField(i, "label", e.target.value)}
                                className={`form-select text-sm ${
                                  te.label
                                    ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                                    : ""
                                }`}
                              >
                                <option value="">Select Tier Type</option>
                                {TIERS.map((tierOption) => (
                                  <option key={tierOption} value={tierOption}>
                                    {tierOption}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Price input */}
                            <div
                              className={`flex-1 flex items-center bg-white border rounded-lg overflow-hidden px-3 ${
                                te.price ? "border-red-500" : "border-slate-200"
                              }`}
                            >
                              <span className={`text-sm font-semibold ${te.price ? "text-red-400" : "text-slate-400"}`}>
                                ₹
                              </span>
                              <input
                                placeholder={tier.label === "Free" ? "0" : "Price"}
                                type="number"
                                min="0"
                                className="w-full border-none bg-transparent outline-none px-2 py-2 text-sm text-slate-700"
                                value={tier.price}
                                onChange={(e) => updateTierField(i, "price", e.target.value)}
                                disabled={tier.label === "Free"}
                              />
                            </div>

                            {tiers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTier(i)}
                                className="text-slate-300 hover:text-red-600 shrink-0"
                              >
                                <Close style={{ fontSize: 16 }} />
                              </button>
                            )}
                          </div>

                          {/* Per-tier error messages */}
                          {(te.label || te.price) && (
                            <div className="px-1 space-y-0.5">
                              {te.label && <FieldError error={te.label} />}
                              {te.price && <FieldError error={te.price} />}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Event Perks */}
                <div className="mt-6">
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Event Perks & Inclusions
                  </label>
                  <p className="mb-3 text-[10px] text-slate-400">
                    Select all perks included with this event
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PERKS_LIST.map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => togglePerk(p)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          selectedPerks.includes(p)
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                        }`}
                      >
                        {selectedPerks.includes(p) ? "✓ " : ""}
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Sidebar ── */}
            <div className="space-y-5">
              {/* Contact */}
              <div className="glass-card p-5">
                <h2 className="mb-4 text-sm font-black text-indigo-600">
                  4. Organizer Contact
                </h2>
                <div className="space-y-3">
                  {/* Organizer Name */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Organizer Name <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        fieldErrors.organizerName
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="Enter organizer name"
                      value={organizerName}
                      onChange={(e) => {
                        setOrganizerName(e.target.value);
                        if (fieldErrors.organizerName) validateField("organizerName", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("organizerName", e.target.value)}
                    />
                    <FieldError error={fieldErrors.organizerName} />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Mobile Number <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-input ${
                        fieldErrors.organizerMobile
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="Enter mobile number"
                      value={organizerMobile}
                      onChange={(e) => {
                        setOrganizerMobile(e.target.value);
                        if (fieldErrors.organizerMobile) validateField("organizerMobile", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("organizerMobile", e.target.value)}
                    />
                    <FieldError error={fieldErrors.organizerMobile} />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Email ID
                    </label>
                    <input
                      type="email"
                      className={`form-input ${
                        fieldErrors.organizerEmail
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : ""
                      }`}
                      placeholder="Enter email"
                      value={organizerEmail}
                      onChange={(e) => {
                        setOrganizerEmail(e.target.value);
                        if (fieldErrors.organizerEmail) validateField("organizerEmail", e.target.value);
                      }}
                      onBlur={(e) => handleFieldBlur("organizerEmail", e.target.value)}
                    />
                    <FieldError error={fieldErrors.organizerEmail} />
                  </div>

                  {/* Best Time to Contact */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Best Time to Contact
                    </label>
                    <select
                      className="form-select"
                      value={organizerBestTime}
                      onChange={(e) => setOrganizerBestTime(e.target.value)}
                    >
                      <option value="">Select Time</option>
                      {TIMES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* QR Info */}
              <div className="glass-card p-4 bg-indigo-50 border border-indigo-100">
                <div className="flex gap-3">
                  <QrCode2 className="text-indigo-600 shrink-0 mt-0.5" style={{ fontSize: 32 }} />
                  <div>
                    <p className="text-sm font-bold text-indigo-900">
                      Auto QR Ticket Generation
                    </p>
                    <p className="mt-1 text-xs text-indigo-700">
                      Once published, every attendee receives a unique QR code
                      for check-in.
                    </p>
                  </div>
                </div>
              </div>

              {/* Review & Submit */}
              <div className="glass-card p-5">
                <h2 className="mb-4 text-sm font-black text-indigo-600">
                  5. Review & Publish
                </h2>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    checked={agreement}
                    onChange={(e) => setAgreement(e.target.checked)}
                  />
                  <span>
                    I confirm that all event details are accurate and complies
                    with platform policies.
                  </span>
                </label>
                {submitting && (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>Uploading images to Cloudinary…</span>
                      <span className="font-semibold text-indigo-600">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/organizer/dashboard")}
                    className="btn-outline py-2.5 text-sm"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-2.5 text-sm font-bold text-white"
                    disabled={submitting}
                  >
                    {submitting ? "Publishing..." : "Publish Event"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

    </div>
  );
}