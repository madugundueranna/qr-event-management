// src/pages/public/Register.jsx  →  QREventix Register with email OTP verification

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiCheck, FiMail,
  FiMapPin, FiPhone, FiShield, FiUser, FiBriefcase,
  FiAlertCircle, FiRefreshCw,
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import Button from "../../components/common/Button";
import { sendOtp, verifyOtp } from "../../api/authApi";

const INTERESTS = [
  "Music Festivals", "Tech Conferences", "Art Exhibitions",
  "Comedy Shows", "Sports Events", "Business Workshops",
];

// ── Main Register component ───────────────────────────────────────────────────
export default function Register() {
  const [role, setRole] = useState("attendee");
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Form fields
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Email OTP state
  const [otpSent, setOtpSent]           = useState(false);
  const [otpValue, setOtpValue]         = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp]     = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError]         = useState("");
  const [cooldown, setCooldown]         = useState(0);

  // Form errors / submit
  const [errors, setErrors]       = useState({});
  const [error, setError]         = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Reset OTP state when email changes
  const handleEmailChange = (val) => {
    setEmail(val);
    if (emailVerified || otpSent) {
      setOtpSent(false);
      setOtpValue("");
      setEmailVerified(false);
      setOtpError("");
    }
    if (errors.email) setErrors((p) => { const n = {...p}; delete n.email; return n; });
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:1998";
    window.location.href = `${backendUrl}/auth/google`;
  };

  // ── Send OTP ────────────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrors((p) => ({ ...p, email: "Email address is required." }));
      return;
    }
    if (!emailRegex.test(email)) {
      setErrors((p) => ({ ...p, email: "Enter a valid email address." }));
      return;
    }
    setErrors((p) => { const n = {...p}; delete n.email; return n; });
    setOtpError("");
    setSendingOtp(true);
    try {
      await sendOtp(email.trim().toLowerCase(), "email-verify");
      setOtpSent(true);
      setOtpValue("");
      setCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP. Please try again.";
      setOtpError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify OTP ──────────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      setOtpError("Please enter the full 6-digit code.");
      return;
    }
    setOtpError("");
    setVerifyingOtp(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), otpValue, "email-verify");
      setPassword(otpValue);
      setEmailVerified(true);
      setOtpSent(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid OTP. Please try again.";
      setOtpError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const clearError = (field) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const toggleInterest = (interest) =>
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((x) => x !== interest) : [...prev, interest]
    );

  // ── Validate form ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name is required.";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!mobileNumber.trim()) e.mobileNumber = "Mobile number is required.";
    else if (!/^\+?[\d\s\-]{7,15}$/.test(mobileNumber.trim())) e.mobileNumber = "Enter a valid mobile number.";
    if (!email.trim()) e.email = "Email address is required.";
    if (!emailVerified) e.email = "Please verify your email first.";
    if (role === "organizer") {
      if (!companyName.trim()) e.companyName = "Company / Organization name is required.";
    }
    if (!agreed) e.agreed = "You must agree to the Terms & Conditions.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const isAgency = role === "organizer";
    const payload = {
      name,
      email: email.trim().toLowerCase(),
      password,
      mobileNumber,
      companyName: isAgency ? companyName : "",
      isAgency,
    };
    const res = await registerUser(payload);
    if (res.success) {
      setSuccessMsg("Account registered successfully! Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } else {
      setError(res.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  const canSubmit = emailVerified && agreed && !submitting;

  return (
    <main className="min-h-screen bg-[linear-gradient(120deg,#07122d,#25345c)] text-white">
      <div className="container-page grid min-h-screen gap-8 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

        {/* ── Left Hero ── */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-black">Q</div>
            <div>
              <p className="font-black tracking-[0.3em]">QREventix</p>
              <p className="text-xs tracking-[0.4em] text-white/50">EVENTS</p>
            </div>
          </div>
          <div>
            <p className="text-xl text-indigo-300">START YOUR JOURNEY</p>
            <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
              Create <br />Account
            </h1>
            <p className="mt-6 max-w-lg text-xl text-white/80">
              Join thousands of attendees and organizers today. Enjoy paperless QR-entry.
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-2 gap-4">
            <div className="rounded-2xl bg-black/30 p-5 backdrop-blur">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-white/70">Verified Events</p>
            </div>
            <div className="rounded-2xl bg-black/30 p-5 backdrop-blur">
              <p className="text-3xl font-bold">Instant</p>
              <p className="text-white/70">QR Tickets Delivery</p>
            </div>
          </div>
        </section>

        {/* ── Right Form Card ── */}
        <section className="rounded-3xl border border-white/40 bg-white/70 p-5 text-ink-900 shadow-card backdrop-blur-2xl md:p-8">

          {/* Role switcher */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex rounded-xl bg-slate-100 p-1">
              {["attendee", "organizer"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(""); }}
                  className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition ${
                    role === r ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="hidden rounded-xl border border-white/50 bg-white/40 px-4 py-2.5 text-xs font-semibold md:flex items-center gap-1.5">
              <FiShield className="text-indigo-600" /> Secure Registration
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-black">Sign Up as {role === "attendee" ? "Attendee" : "Organizer"}</h2>
            <p className="text-sm text-slate-500 mt-1">Enter your details to create a free account</p>
          </div>

          {/* Google sign up */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mb-5 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition"
          >
            <FaGoogle className="text-red-500" />
            Sign up with Google
          </button>

          <div className="mb-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            or sign up with email
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                <FiAlertCircle className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700 border border-green-200 font-semibold">
                {successMsg}
              </div>
            )}

            {/* Name + Mobile */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Full Name *</label>
                <div className="relative">
                  <FiUser size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.name ? "text-red-400" : "text-slate-400"}`} />
                  <input
                    className={`form-input pl-9 text-sm ${errors.name ? "border-red-500 focus:ring-red-400" : ""}`}
                    placeholder="Nandu"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearError("name"); }}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Mobile Number *</label>
                <div className="relative">
                  <FiPhone size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.mobileNumber ? "text-red-400" : "text-slate-400"}`} />
                  <input
                    className={`form-input pl-9 text-sm ${errors.mobileNumber ? "border-red-500 focus:ring-red-400" : ""}`}
                    placeholder="+91 XXXXX XXXXX"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => { setMobileNumber(e.target.value); clearError("mobileNumber"); }}
                  />
                </div>
                {errors.mobileNumber && <p className="mt-1 text-xs text-red-500">{errors.mobileNumber}</p>}
              </div>
            </div>

            {/* Email with Verify button */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Email Address *</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiMail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.email ? "text-red-400" : emailVerified ? "text-green-500" : "text-slate-400"}`} />
                  <input
                    className={`form-input pl-9 text-sm pr-9 ${
                      errors.email ? "border-red-500 focus:ring-red-400"
                      : emailVerified ? "border-green-400 bg-green-50 focus:ring-green-200"
                      : ""
                    }`}
                    placeholder="john@example.com"
                    type="email"
                    value={email}
                    disabled={emailVerified}
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                  {emailVerified && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                      <FiCheck size={12} />
                    </div>
                  )}
                </div>

                {!emailVerified && (
                  <button
                    type="button"
                    disabled={sendingOtp || cooldown > 0}
                    onClick={otpSent ? undefined : handleSendOtp}
                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed
                      ${otpSent
                        ? "bg-slate-100 text-slate-500 cursor-default"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                  >
                    {sendingOtp ? (
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending…
                      </span>
                    ) : otpSent ? "Sent ✓" : "Verify"}
                  </button>
                )}

                {emailVerified && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailVerified(false);
                      setOtpSent(false);
                      setOtpValue("");
                      setOtpError("");
                    }}
                    className="shrink-0 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-red-300 hover:text-red-500 transition"
                    title="Change email"
                  >
                    Change
                  </button>
                )}
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              {!otpSent && !emailVerified && otpError && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-semibold">
                  <FiAlertCircle size={12} /> {otpError}
                </p>
              )}
              {emailVerified && (
                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-green-600">
                  <FiCheck size={12} /> Email verified
                </p>
              )}
            </div>

            {/* Inline OTP input */}
            {otpSent && !emailVerified && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Enter 6-digit code sent to <span className="text-indigo-600">{email}</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter OTP"
                    disabled={verifyingOtp}
                    value={otpValue}
                    onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6)); setOtpError(""); }}
                    className={`form-input flex-1 text-sm tracking-[0.3em] font-bold text-center ${otpError ? "border-red-400 focus:ring-red-300" : "border-indigo-300 focus:ring-indigo-200"}`}
                  />
                  <button
                    type="button"
                    disabled={verifyingOtp || otpValue.length !== 6}
                    onClick={handleVerifyOtp}
                    className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {verifyingOtp ? (
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Verifying…
                      </span>
                    ) : "Confirm"}
                  </button>
                </div>
                {otpError && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-600 font-semibold">
                    <FiAlertCircle size={12} /> {otpError}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Code expires in 10 minutes. &nbsp;
                  {cooldown > 0 ? (
                    <span className="font-semibold text-slate-500">Resend in {cooldown}s</span>
                  ) : (
                    <button type="button" onClick={handleSendOtp} className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1">
                      <FiRefreshCw size={11} /> Resend
                    </button>
                  )}
                </p>
              </div>
            )}


            {/* Organizer extras */}
            {role === "organizer" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Company / Organization *</label>
                  <div className="relative">
                    <FiBriefcase size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.companyName ? "text-red-400" : "text-slate-400"}`} />
                    <input
                      className={`form-input pl-9 text-sm ${errors.companyName ? "border-red-500 focus:ring-red-400" : ""}`}
                      placeholder="Priya Events Pvt Ltd"
                      value={companyName}
                      onChange={(e) => { setCompanyName(e.target.value); clearError("companyName"); }}
                    />
                  </div>
                  {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">City</label>
                  <div className="relative">
                    <FiMapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="form-input pl-9 text-sm"
                      placeholder="Bangalore"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">Select Your Event Interests</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="pt-1">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); clearError("agreed"); }}
                  className={`mt-1 h-4 w-4 rounded focus:ring-indigo-500 ${errors.agreed ? "border-red-500 accent-red-500" : "border-slate-300 text-indigo-600"}`}
                />
                <span className="text-xs text-slate-500 leading-tight">
                  I agree to the{" "}
                  <Link to="/" className="text-indigo-600 font-semibold hover:underline">Terms &amp; Conditions</Link>
                  {" "}and{" "}
                  <Link to="/" className="text-indigo-600 font-semibold hover:underline">Privacy Policy</Link>.
                </span>
              </div>
              {errors.agreed && <p className="mt-1 text-xs text-red-500">{errors.agreed}</p>}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className={`w-full text-base py-3.5 transition ${!canSubmit ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!canSubmit}
            >
              {submitting ? "Registering..." : "Register & Continue"}
            </Button>

            {/* Status tip */}
            {!canSubmit && !submitting && (
              <p className="text-center text-xs text-slate-400">
                {!emailVerified ? "Verify your email to continue" :
                 !agreed ? "Accept the Terms to continue" : ""}
              </p>
            )}
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">Login</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
