// src/pages/public/Login.jsx  →  QREventix Login

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiShield, FiMail, FiLock, FiUser, FiBriefcase,
} from "react-icons/fi";
import { MdQrCode2, MdOutlineQrCodeScanner } from "react-icons/md";
import { FaGoogle, FaMicrosoft, FaApple, FaLinkedin } from "react-icons/fa";
import Button from "../../components/common/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const portals = [
    {
      title: "Attendee",
      subtitle: "Browse & Book Events",
      icon: <FiUser />,
      role: "Attendee",
      color: "bg-indigo-600",
    },
    {
      title: "Organizer",
      subtitle: "Create & Manage Events",
      icon: <FiBriefcase />,
      role: "Organizer",
      color: "bg-violet-600",
    },
    {
      title: "Admin",
      subtitle: "Platform Management",
      icon: <MdOutlineQrCodeScanner />,
      role: "Admin",
      color: "bg-slate-700",
    },
  ];

  const handlePortalClick = (role) => {
    setError("");
    setEmailError("");
    setPasswordError("");
    if (role === "Attendee") {
      setEmail("attendee@qreventix.com");
      setPassword("password123");
    } else if (role === "Organizer") {
      setEmail("organizer@qreventix.com");
      setPassword("password123");
    } else if (role === "Admin") {
      setEmail("admin@qreventix.com");
      setPassword("password123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setError("");

    if (!email) {
      setEmailError("Email address is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }

    if (!valid) return;

    setSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      const userRole = res.user?.role;

      if (userRole === "Admin") {
        navigate("/admin", { replace: true });
      } else if (userRole === "Organizer") {
        navigate("/organizer/dashboard", { replace: true });
      } else {
        navigate("/attendee/dashboard", { replace: true });
      }
    } else {
      setError(res.message || "Invalid email or password.");
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:1998";
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(120deg,#07122d,#25345c)] text-white">
      <div className="container-page grid min-h-screen gap-8 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        {/* Left Hero */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-2xl font-black">Q</div>
            <div>
              <p className="font-black tracking-[0.3em]">QREventix</p>
              <p className="text-xs tracking-[0.4em] text-white/50">EVENTS</p>
            </div>
          </div>

          <div>
            <p className="text-xl text-indigo-300">WELCOME TO</p>
            <h1 className="mt-4 text-5xl font-black leading-tight md:text-7xl">
              QR<br />Eventix
            </h1>
            <p className="mt-6 max-w-lg text-xl text-white/80">
              Discover, book, and check in to amazing events — all powered by instant QR tickets.
            </p>
          </div>

          <div className="grid max-w-xl grid-cols-2 gap-4">
            <div className="rounded-2xl bg-black/30 p-5 backdrop-blur">
              <p className="text-3xl font-bold">15K+</p>
              <p className="text-white/70">Events Hosted</p>
            </div>
            <div className="rounded-2xl bg-black/30 p-5 backdrop-blur">
              <p className="text-3xl font-bold">30K+</p>
              <p className="text-white/70">Happy Attendees</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-indigo-600/20 p-4 border border-indigo-500/30">
            <MdQrCode2 className="text-3xl text-indigo-300 shrink-0" />
            <p className="text-sm text-indigo-200">
              Instant QR ticket generation · Contactless check-in · Verified events
            </p>
          </div>
        </section>

        {/* Right Form */}
        <section className="rounded-3xl border border-white/40 bg-white/70 p-5 text-ink-900 shadow-card backdrop-blur-2xl md:p-8">
          <div className="mb-6 flex justify-end gap-4">
            <div className="hidden rounded-xl border border-white/50 bg-white/40 px-4 py-3 text-sm font-semibold md:flex items-center gap-2">
              <FiShield className="text-indigo-600" /> Secure & Trusted
            </div>
            <div className="rounded-xl border border-white/50 bg-white/40 px-4 py-3 text-sm font-semibold">
              English
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-black">Login to QREventix</h2>
            <p className="mt-2 text-slate-600">Click a portal below to auto-fill demo accounts or use form</p>
          </div>

          {/* Portal Selection */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {portals.map((portal) => (
              <button
                type="button"
                key={portal.title}
                onClick={() => handlePortalClick(portal.role)}
                className="rounded-2xl border border-slate-200 bg-white/70 p-5 text-center shadow-soft transition hover:border-indigo-400 hover:shadow-card focus:outline-none"
              >
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${portal.color} text-2xl text-white`}>
                  {portal.icon}
                </div>
                <h3 className="mt-4 font-bold">{portal.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{portal.subtitle}</p>
              </button>
            ))}
          </div>

          <div className="my-6 flex items-center gap-4 text-sm text-slate-500">
            <div className="h-px flex-1 bg-slate-200" />
            or login with email
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <div className="relative">
                <FiMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={`form-input pl-11 ${emailError ? "border-red-400 focus:ring-red-300" : ""}`}
                  placeholder="Enter your email address"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                />
              </div>
              {emailError && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <span>⚠</span> {emailError}
                </p>
              )}
            </div>

            <div>
              <div className="relative">
                <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={`form-input pl-11 ${passwordError ? "border-red-400 focus:ring-red-300" : ""}`}
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                />
              </div>
              {passwordError && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <span>⚠</span> {passwordError}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
