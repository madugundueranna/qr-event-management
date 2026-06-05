import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import { resetPassword } from "../../api/authApi";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "This link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "bg-orange-400", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-yellow-400", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  })();

  return (
    <main className="min-h-screen bg-[linear-gradient(120deg,#07122d,#25345c)] flex items-center justify-center px-4">
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
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <FiCheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-black text-white">Password updated!</h2>
              <p className="mt-3 text-white/70">
                Your password has been reset successfully. Redirecting you to login…
              </p>
              <Link
                to="/login"
                className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-500"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-300">
                  <FiLock size={28} />
                </div>
                <h2 className="text-2xl font-black text-white">Set new password</h2>
                <p className="mt-2 text-white/60 text-sm">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-red-500/20 border border-red-400/30 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div className="relative">
                  <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (min. 8 characters)"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pl-11 pr-11 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                {/* Strength bar */}
                {strength && (
                  <div>
                    <div className="h-1.5 w-full rounded-full bg-white/10">
                      <div className={`h-1.5 rounded-full transition-all ${strength.color} ${strength.width}`} />
                    </div>
                    <p className="mt-1 text-right text-xs text-white/50">{strength.label}</p>
                  </div>
                )}

                {/* Confirm password */}
                <div className="relative">
                  <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pl-11 pr-11 text-white placeholder:text-white/40 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating…" : "Reset Password"}
                </button>
              </form>

              <Link
                to="/login"
                className="mt-5 flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white transition"
              >
                <FiArrowLeft size={14} /> Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
