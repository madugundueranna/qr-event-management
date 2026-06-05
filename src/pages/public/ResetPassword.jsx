import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft,
  FiAlertCircle, FiCheck,
} from "react-icons/fi";
import { resetPassword } from "../../api/authApi";

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
const STRENGTH_TEXT   = ["", "text-red-500", "text-orange-500", "text-yellow-600", "text-green-600"];

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const strength = getStrength(password);
  const pwScore  = Object.values(strength).filter(Boolean).length;
  const pwValid  = password.length >= 8;
  const matches  = confirm.length > 0 && confirm === password;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = pwValid && matches && !loading;

  const clearError = (field) =>
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwValid) errs.password = "Password must be at least 8 characters.";
    if (!confirm) errs.confirm = "Please confirm your password.";
    else if (!matches) errs.confirm = "Passwords do not match.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setErrors({ form: err?.response?.data?.message || "This link is invalid or has expired." });
    } finally {
      setLoading(false);
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

          {/* ── Success state ── */}
          {success ? (
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-500">
                <FiCheckCircle size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Password updated!</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Your password has been reset successfully.
                </p>
              </div>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="w-full rounded-xl py-3.5 text-base font-bold text-white transition
                  bg-gradient-to-r from-[#6C5CE7] to-[#4f46e5]
                  hover:from-[#5a4bd1] hover:to-[#4338ca]"
              >
                Go to Login
              </button>
            </div>
          ) : (

            /* ── Reset form ── */
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
                  <FiLock size={28} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Reset Your Password</h2>
                <p className="mt-1 text-sm text-slate-500">Create a new password for your account.</p>
              </div>

              {errors.form && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <FiAlertCircle className="mt-0.5 shrink-0" size={15} />
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">

                {/* New password */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">New Password *</label>
                  <div className="relative">
                    <FiLock
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${errors.password ? "text-red-400" : "text-slate-400"}`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                      placeholder="Create a new password"
                      className={`form-input pl-9 pr-10 text-sm ${errors.password ? "border-red-500 focus:ring-red-400" : ""}`}
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
                    <p className="mt-1 text-xs text-amber-500">
                      Minimum 8 characters required ({password.length}/8)
                    </p>
                  )}

                  {/* Strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              pwScore >= i ? STRENGTH_COLORS[pwScore] : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-semibold ${STRENGTH_TEXT[pwScore]}`}>
                          {STRENGTH_LABELS[pwScore]}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { ok: strength.length, label: "8+ characters" },
                          { ok: strength.upper,  label: "Uppercase letter" },
                          { ok: strength.number, label: "Number (0-9)" },
                          { ok: strength.symbol, label: "Symbol (!@#...)" },
                        ].map(({ ok, label }) => (
                          <p
                            key={label}
                            className={`flex items-center gap-1 text-xs ${ok ? "text-green-600" : "text-slate-400"}`}
                          >
                            <FiCheck size={10} className={ok ? "text-green-500" : "text-slate-300"} />
                            {label}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Confirm Password *</label>
                  <div className="relative">
                    <FiLock
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        errors.confirm || mismatch ? "text-red-400" : matches ? "text-green-500" : "text-slate-400"
                      }`}
                    />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); clearError("confirm"); }}
                      placeholder="Repeat your password"
                      className={`form-input pl-9 pr-10 text-sm ${
                        errors.confirm || mismatch
                          ? "border-red-500 focus:ring-red-400"
                          : matches
                            ? "border-green-500 focus:ring-green-400"
                            : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                    {matches && (
                      <FiCheck
                        size={15}
                        className="absolute right-9 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none"
                      />
                    )}
                  </div>
                  {(errors.confirm || mismatch) && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.confirm || "Passwords do not match."}
                    </p>
                  )}
                  {matches && (
                    <p className="mt-1 text-xs text-green-600">Passwords match!</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full rounded-xl py-3.5 text-base font-bold text-white transition
                    bg-gradient-to-r from-[#6C5CE7] to-[#4f46e5]
                    hover:from-[#5a4bd1] hover:to-[#4338ca]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Resetting…
                    </span>
                  ) : "Reset Password"}
                </button>

                {!canSubmit && !loading && (
                  <p className="text-center text-xs text-slate-400">
                    {!pwValid
                      ? "Password must be at least 8 characters"
                      : mismatch
                        ? "Passwords must match to continue"
                        : !confirm
                          ? "Confirm your password to continue"
                          : ""}
                  </p>
                )}
              </form>

              <div className="mt-5 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6C5CE7] hover:underline"
                >
                  <FiArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
