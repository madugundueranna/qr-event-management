import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail, FiAlertCircle, FiArrowLeft, FiRefreshCw, FiCheck,
} from "react-icons/fi";
import { forgotPassword } from "../../api/authApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = request, 2 = confirmation

  // Step 1
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // Step 2
  const [cooldown, setCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSend = async () => {
    if (!email.trim()) { setEmailError("Email address is required."); return; }
    if (!EMAIL_REGEX.test(email.trim())) { setEmailError("Please enter a valid email address."); return; }
    setEmailError("");
    setSendError("");
    setSending(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setStep(2);
      setCooldown(30);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setSendError("No account found with that email address.");
      } else if (status === 429) {
        setSendError("Too many attempts. Please wait a moment before trying again.");
      } else {
        setSendError(err.response?.data?.message || "Failed to send reset link. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    setResendError("");
    setResendSuccess(false);
    setResendLoading(true);
    try {
      await forgotPassword(email.trim().toLowerCase());
      setCooldown(30);
      setResendSuccess(true);
    } catch (err) {
      setResendError(err.response?.data?.message || "Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(120deg,#07122d,#25345c)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C5CE7] text-2xl font-black text-white">
            Q
          </div>
          <div>
            <p className="font-black tracking-[0.3em] text-white">QREventix</p>
            <p className="text-xs tracking-[0.4em] text-white/50">EVENTS</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/40 bg-white/70 p-8 text-slate-900 shadow-card backdrop-blur-2xl">

          {/* ── Screen 1: Request reset ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center gap-2 mb-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7] mb-1">
                  <FiMail size={30} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Forgot Password?</h2>
                <p className="text-sm text-slate-500 max-w-xs">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {sendError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <FiAlertCircle className="mt-0.5 shrink-0" size={15} />
                  {sendError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail
                    size={16}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${emailError ? "text-red-400" : "text-slate-400"}`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); setSendError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`form-input pl-9 text-sm ${emailError ? "border-red-500 focus:ring-red-400" : ""}`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                    <FiAlertCircle size={11} /> {emailError}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={sending}
                onClick={handleSend}
                className="w-full rounded-xl py-3.5 text-base font-bold text-white transition
                  bg-gradient-to-r from-[#6C5CE7] to-[#4f46e5]
                  hover:from-[#5a4bd1] hover:to-[#4338ca]
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending…
                  </span>
                ) : "Send Reset Link"}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C5CE7] hover:underline"
                >
                  <FiArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* ── Screen 2: Confirmation ── */}
          {step === 2 && (
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7]">
                <FiMail size={38} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">Check your email</h2>
                <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">
                  We've sent a password reset link to{" "}
                  <span className="font-semibold text-slate-700">{email}</span>.{" "}
                  The link expires in 15 minutes.
                </p>
              </div>

              {resendError && (
                <div className="w-full flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <FiAlertCircle className="mt-0.5 shrink-0" size={15} />
                  {resendError}
                </div>
              )}
              {resendSuccess && (
                <div className="w-full flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  <FiCheck className="shrink-0" size={15} />
                  Reset link resent successfully!
                </div>
              )}

              <p className="text-sm text-slate-500">
                Didn't receive it?{" "}
                {cooldown > 0 ? (
                  <span className="font-semibold text-slate-400">
                    Resend in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={resendLoading}
                    onClick={handleResend}
                    className="inline-flex items-center gap-1 font-semibold text-[#6C5CE7] hover:underline disabled:opacity-60"
                  >
                    <FiRefreshCw size={13} className={resendLoading ? "animate-spin" : ""} />
                    Resend link
                  </button>
                )}
              </p>

              <div className="w-full pt-4 border-t border-slate-200">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C5CE7] hover:underline"
                >
                  <FiArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
