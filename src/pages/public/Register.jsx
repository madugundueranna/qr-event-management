import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sendOtp, verifyOtp } from "../../api/authApi";
import {
  FiMail, FiPhone, FiUser, FiLock, FiEye, FiEyeOff,
  FiShield, FiBriefcase, FiMapPin, FiAlertCircle, FiCheckCircle,
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import Button from "../../components/common/Button";

const INTERESTS = [
  "Music Festivals", "Tech Conferences", "Art Exhibitions",
  "Comedy Shows", "Sports Events", "Business Workshops",
];

export default function Register() {
  const [role, setRole] = useState("attendee");
  const [selectedInterests, setSelectedInterests] = useState([]);

  const [name, setName]               = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [city, setCity]               = useState("");
  const [agreed, setAgreed]           = useState(false);

  const [errors, setErrors]       = useState({});
  const [error, setError]         = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // OTP flow
  const [otpStep, setOtpStep]         = useState(false); // true = show OTP input
  const [otp, setOtp]                 = useState("");
  const [otpError, setOtpError]       = useState("");
  const [otpSending, setOtpSending]   = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const clearError = (field) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const toggleInterest = (interest) =>
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((x) => x !== interest) : [...prev, interest]
    );

  const handleGoogleLogin = () => {
    const backendUrl = (import.meta.env.VITE_API_URL || "http://localhost:1998").replace(/\/$/, "");
    window.location.href = `${backendUrl}/auth/google`;
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const id = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address first." }));
      return;
    }
    setOtpSending(true);
    setOtpError("");
    try {
      await sendOtp(email.trim().toLowerCase(), "email-verify");
      setOtpStep(true);
      startResendTimer();
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { setOtpError("Enter the OTP code."); return; }
    setOtpSending(true);
    setOtpError("");
    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim(), "email-verify");
      setOtpVerified(true);
      setOtpStep(false);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name is required.";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters.";

    if (!mobileNumber.trim()) e.mobileNumber = "Mobile number is required.";
    else if (!/^\+?[\d\s\-]{7,15}$/.test(mobileNumber.trim()))
      e.mobileNumber = "Enter a valid mobile number.";

    if (!email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "Enter a valid email address.";

    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";

    if (role === "organizer" && !companyName.trim())
      e.companyName = "Company / Organization name is required.";

    if (!agreed) e.agreed = "You must agree to the Terms & Conditions.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    if (!otpVerified) {
      await handleSendOtp();
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
      setSuccessMsg("Account registered successfully! Redirecting to login…");
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } else {
      setError(res.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  };

  const canSubmit = agreed && !submitting && !otpStep
    && name.trim() && mobileNumber.trim() && email.trim()
    && password.length >= 8
    && (role !== "organizer" || companyName.trim());

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
        <section className="rounded-3xl border border-white/40 bg-white/70 p-5 text-slate-900 shadow-card backdrop-blur-2xl md:p-8">

          {/* Role switcher */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex rounded-xl bg-slate-100 p-1">
              {["attendee", "organizer"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(""); setErrors({}); }}
                  className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition ${
                    role === r ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-1.5 rounded-xl border border-white/50 bg-white/40 px-4 py-2.5 text-xs font-semibold md:flex">
              <FiShield className="text-indigo-600" /> Secure Registration
            </div>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-black">
              Sign Up as {role === "attendee" ? "Attendee" : "Organizer"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Enter your details to create a free account</p>
          </div>

          {/* Google sign up */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <FaGoogle className="text-red-500" />
            Sign up with Google
          </button>

          <div className="mb-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            or sign up with email
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <FiAlertCircle className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
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
                    placeholder="Your full name"
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

            {/* Email */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Email Address *</label>
              <div className="relative">
                <FiMail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.email ? "text-red-400" : otpVerified ? "text-green-500" : "text-slate-400"}`} />
                <input
                  className={`form-input pl-9 pr-24 text-sm ${errors.email ? "border-red-500 focus:ring-red-400" : otpVerified ? "border-green-400 bg-green-50" : ""}`}
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  readOnly={otpVerified || otpStep}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); setOtpVerified(false); setOtpStep(false); }}
                />
                {otpVerified ? (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold text-green-600">
                    <FiCheckCircle /> Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpSending || otpStep || !email.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-50 hover:bg-indigo-700"
                  >
                    {otpSending ? "Sending…" : otpStep ? "Sent" : "Send OTP"}
                  </button>
                )}
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* OTP Input */}
            {otpStep && !otpVerified && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
                <p className="text-xs text-indigo-700 font-semibold">
                  A 6-digit code was sent to <strong>{email}</strong>. Enter it below.
                </p>
                <div className="flex gap-2">
                  <input
                    className="form-input flex-1 text-center text-lg font-bold tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpSending || otp.length < 6}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 hover:bg-indigo-700"
                  >
                    {otpSending ? "Verifying…" : "Verify"}
                  </button>
                </div>
                {otpError && <p className="text-xs text-red-500">{otpError}</p>}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0 || otpSending}
                  className="text-xs text-indigo-600 font-semibold disabled:opacity-50 hover:underline"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Password *</label>
              <div className="relative">
                <FiLock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.password ? "text-red-400" : "text-slate-400"}`} />
                <input
                  className={`form-input pl-9 pr-10 text-sm ${errors.password ? "border-red-500 focus:ring-red-400" : ""}`}
                  placeholder="Create a password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              {!errors.password && password && password.length < 8 && (
                <p className="mt-1 text-xs text-amber-500">Minimum 8 characters required ({password.length}/8)</p>
              )}
            </div>

            {/* Organizer extras / Attendee interests */}
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
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {interest}
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
                  id="terms"
                  checked={agreed}
                  onChange={(e) => { setAgreed(e.target.checked); clearError("agreed"); }}
                  className={`mt-0.5 h-4 w-4 rounded ${errors.agreed ? "accent-red-500" : "accent-indigo-600"}`}
                />
                <label htmlFor="terms" className="cursor-pointer text-xs leading-tight text-slate-500">
                  I agree to the{" "}
                  <Link to="/terms" className="font-semibold text-indigo-600 hover:underline">Terms &amp; Conditions</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="font-semibold text-indigo-600 hover:underline">Privacy Policy</Link>.
                </label>
              </div>
              {errors.agreed && <p className="mt-1 text-xs text-red-500">{errors.agreed}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-xl py-3.5 text-base font-bold text-white transition
                bg-gradient-to-r from-[#6C5CE7] to-[#4f46e5]
                hover:from-[#5a4bd1] hover:to-[#4338ca]
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Registering…
                </span>
              ) : otpVerified ? "Register & Continue" : "Verify Email & Continue"}
            </button>

            {!canSubmit && !submitting && !otpStep && (
              <p className="text-center text-xs text-slate-400">
                {!agreed ? "Accept the Terms to continue" : "Fill in all required fields to continue"}
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
