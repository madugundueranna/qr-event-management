// src/pages/public/ForgotPassword.jsx  →  3-step OTP password reset

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiAlertCircle, FiArrowLeft, FiCheck, FiCheckCircle,
  FiEye, FiEyeOff, FiLock, FiMail, FiRefreshCw,
} from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import { sendOtp, verifyOtp, resetPasswordViaOtp } from "../../api/authApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw) {
  return {
    length: pw.length >= 8,
    upper:  /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
  };
}
const STRENGTH_COLORS = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_TEXT   = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-green-400"];

// ── 6-box OTP input ───────────────────────────────────────────────────────────
function OtpBoxes({ value, onChange, disabled }) {
  const boxes = useRef([]);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      if (!value[i] && i > 0) {
        boxes.current[i - 1]?.focus();
        const arr = value.split("");
        arr[i - 1] = "";
        onChange(arr.join(""));
      } else {
        const arr = value.split("");
        arr[i] = "";
        onChange(arr.join(""));
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      boxes.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      boxes.current[i + 1]?.focus();
    }
  };

  const handleChange = (i, char) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const arr = value.padEnd(6, " ").split("");
    arr[i] = digit;
    const next = arr.join("").trimEnd().slice(0, 6);
    onChange(next);
    if (digit && i < 5) setTimeout(() => boxes.current[i + 1]?.focus(), 0);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(digits);
    setTimeout(() => boxes.current[Math.min(digits.length, 5)]?.focus(), 0);
  };

  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => (boxes.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`h-14 w-11 rounded-xl border-2 text-center text-xl font-black outline-none transition
            focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30
            disabled:opacity-40
            ${value[i]
              ? "border-indigo-400 bg-indigo-600/20 text-white"
              : "border-white/20 bg-white/10 text-white"}`}
        />
      ))}
    </div>
  );
}

// ── Step indicators ───────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["Email", "Verify OTP", "New Password"];
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition ${
              done ? "bg-green-500 text-white" :
              active ? "bg-indigo-500 text-white" :
              "bg-white/10 text-white/40"
            }`}>
              {done ? <FiCheck size={12} /> : idx}
            </div>
            <span className={`text-xs font-semibold ${active ? "text-white" : done ? "text-green-400" : "text-white/40"}`}>
              {label}
            </span>
            {i < steps.length - 1 && <div className={`w-6 h-px ${done ? "bg-green-500" : "bg-white/20"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);   // 1 | 2 | 3 | 4 (success)

  // Step 1
  const [email, setEmail]           = useState("");
  const [emailError, setEmailError] = useState("");
  const [sending, setSending]       = useState(false);
  const [sendError, setSendError]   = useState("");

  // Step 2
  const [otpValue, setOtpValue]     = useState("");
  const [otpError, setOtpError]     = useState("");
  const [verifying, setVerifying]   = useState(false);
  const [cooldown, setCooldown]     = useState(0);

  // Step 3
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError]       = useState("");
  const [resetting, setResetting]   = useState(false);

  const pwStrength = getStrength(newPw);
  const pwScore = Object.values(pwStrength).filter(Boolean).length;
  const pwIsValid = pwScore === 4;

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ── Step 1: send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email.trim()) { setEmailError("Email address is required."); return; }
    if (!EMAIL_REGEX.test(email)) { setEmailError("Please enter a valid email."); return; }
    setEmailError("");
    setSendError("");
    setSending(true);
    try {
      await sendOtp(email.trim().toLowerCase(), "password-reset");
      setStep(2);
      setOtpValue("");
      setCooldown(60);
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        setSendError(err.response?.data?.message || "This account uses Google Sign-In.");
      } else if (status === 429) {
        setSendError("Too many attempts. Please wait 10 minutes.");
      } else {
        setSendError(err.response?.data?.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    setOtpError("");
    setSending(true);
    try {
      await sendOtp(email.trim().toLowerCase(), "password-reset");
      setOtpValue("");
      setCooldown(60);
    } catch (err) {
      setOtpError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setSending(false);
    }
  };

  // ── Step 2: verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) { setOtpError("Please enter the full 6-digit code."); return; }
    setOtpError("");
    setVerifying(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), otpValue, "password-reset");
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired OTP.";
      setOtpError(msg);
    } finally {
      setVerifying(false);
    }
  };

  // ── Step 3: reset password ──────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (!pwIsValid) { setPwError("Password must meet all strength requirements."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwError("");
    setResetting(true);
    try {
      await resetPasswordViaOtp(email.trim().toLowerCase(), newPw);
      setStep(4);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password. OTP may have expired.";
      setPwError(msg);
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(120deg,#07122d,#25345c)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-black text-white">Q</div>
          <div>
            <p className="font-black tracking-[0.3em] text-white">QREventix</p>
            <p className="text-xs tracking-[0.4em] text-white/50">EVENTS</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-2xl">

          {/* ── Success ── */}
          {step === 4 ? (
            <div className="text-center space-y-5">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <FiCheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-black text-white">Password Reset!</h2>
              <p className="text-white/70">Your password has been updated successfully. You can now log in.</p>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-500 transition"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-300">
                  <MdQrCode2 size={28} />
                </div>
                <h2 className="text-2xl font-black text-white">Forgot Password?</h2>
                <p className="mt-1 text-sm text-white/60">
                  {step === 1 && "Enter your email and we'll send a verification code."}
                  {step === 2 && `Enter the 6-digit code sent to ${email}`}
                  {step === 3 && "Choose a new strong password."}
                </p>
              </div>

              <Steps current={step} />

              {/* ── Step 1: Email ── */}
              {step === 1 && (
                <div className="space-y-4">
                  {sendError && (
                    <div className="flex items-start gap-2 rounded-xl bg-red-500/20 border border-red-400/40 px-4 py-3 text-sm text-red-300">
                      <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
                      {sendError}
                    </div>
                  )}
                  <div className="relative">
                    <FiMail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${emailError ? "text-red-400" : "text-white/40"}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); setSendError(""); }}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      className={`w-full rounded-xl border px-4 py-3 pl-11 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition ${
                        emailError
                          ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/20"
                          : "border-white/20 focus:border-indigo-400 focus:ring-indigo-400/30"
                      }`}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    />
                  </div>
                  {emailError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-400">
                      <FiAlertCircle size={12} /> {emailError}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={sending}
                    onClick={handleSendOtp}
                    className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-500 disabled:opacity-60 transition"
                  >
                    {sending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending OTP…
                      </span>
                    ) : "Send Verification Code"}
                  </button>
                </div>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <OtpBoxes value={otpValue} onChange={setOtpValue} disabled={verifying} />
                  {otpError && (
                    <p className="flex items-center justify-center gap-1.5 text-xs text-red-400">
                      <FiAlertCircle size={12} /> {otpError}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={verifying || otpValue.length !== 6}
                    onClick={handleVerifyOtp}
                    className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-500 disabled:opacity-60 transition"
                  >
                    {verifying ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Verifying…
                      </span>
                    ) : "Verify Code"}
                  </button>
                  <p className="text-center text-xs text-white/50">
                    Code expires in 10 minutes. &nbsp;
                    {cooldown > 0 ? (
                      <span className="font-semibold text-white/60">Resend in {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        disabled={sending}
                        onClick={handleResend}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                      >
                        <FiRefreshCw size={11} /> Resend code
                      </button>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtpValue(""); setOtpError(""); }}
                    className="w-full text-center text-xs text-white/50 hover:text-white/80 transition"
                  >
                    ← Change email
                  </button>
                </div>
              )}

              {/* ── Step 3: New Password ── */}
              {step === 3 && (
                <form onSubmit={handleReset} className="space-y-4">
                  {/* New password */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">New Password</label>
                    <div className="relative">
                      <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type={showPw ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => { setNewPw(e.target.value); setPwError(""); }}
                        placeholder="Create a strong password"
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pl-11 pr-10 text-white placeholder:text-white/40 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 outline-none transition"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                        {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {newPw.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${pwScore >= i ? STRENGTH_COLORS[pwScore] : "bg-white/20"}`} />
                          ))}
                        </div>
                        <p className={`text-xs font-bold ${STRENGTH_TEXT[pwScore]}`}>{STRENGTH_LABELS[pwScore]}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            { ok: pwStrength.length, label: "8+ characters" },
                            { ok: pwStrength.upper,  label: "Uppercase letter" },
                            { ok: pwStrength.number, label: "Number (0-9)" },
                            { ok: pwStrength.symbol, label: "Symbol (!@#...)" },
                          ].map(({ ok, label }) => (
                            <p key={label} className={`flex items-center gap-1 text-xs ${ok ? "text-green-400" : "text-white/40"}`}>
                              <FiCheck size={10} className={ok ? "text-green-400" : "text-white/20"} />
                              {label}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-white/70">Confirm Password</label>
                    <div className="relative">
                      <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPw}
                        onChange={(e) => { setConfirmPw(e.target.value); setPwError(""); }}
                        placeholder="Repeat your password"
                        className={`w-full rounded-xl border bg-white/10 px-4 py-3 pl-11 pr-10 text-white placeholder:text-white/40 focus:ring-2 outline-none transition ${
                          confirmPw && confirmPw !== newPw
                            ? "border-red-400/70 focus:border-red-400 focus:ring-red-400/20"
                            : confirmPw && confirmPw === newPw
                              ? "border-green-400/70 focus:border-green-400 focus:ring-green-400/20"
                              : "border-white/20 focus:border-indigo-400 focus:ring-indigo-400/30"
                        }`}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                        {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                      {confirmPw && confirmPw === newPw && (
                        <div className="absolute right-9 top-1/2 -translate-y-1/2">
                          <FiCheck size={16} className="text-green-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {pwError && (
                    <p className="flex items-center gap-1.5 text-xs text-red-400">
                      <FiAlertCircle size={12} /> {pwError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={resetting || !pwIsValid || newPw !== confirmPw}
                    className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-500 disabled:opacity-60 transition"
                  >
                    {resetting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Resetting…
                      </span>
                    ) : "Reset Password"}
                  </button>
                </form>
              )}
            </>
          )}

          {step !== 4 && (
            <Link
              to="/login"
              className="mt-5 flex items-center justify-center gap-2 text-sm text-white/50 hover:text-white/80 transition"
            >
              <FiArrowLeft size={14} /> Back to Login
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
