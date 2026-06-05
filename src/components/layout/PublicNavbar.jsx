// src/components/layout/PublicNavbar.jsx  →  QREventix public navbar

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";
import Button from "../common/Button";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";

export default function PublicNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const dashboardPath =
    user?.role === "Admin"
      ? "/admin"
      : user?.role === "Organizer"
      ? "/organizer/dashboard"
      : "/attendee/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-xl">Q</div>
          <div>
            <p className="tracking-[0.25em] text-ink-900 font-bold text-sm">QREventix</p>
            <p className="text-[9px] tracking-[0.4em] text-slate-500">EVENTS</p>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex">
          <NavLink to="/events" className={({ isActive }) => isActive ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"}>
            Events
          </NavLink>
          <NavLink to="/attendee/dashboard" className={({ isActive }) => isActive ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"}>
            My Tickets
          </NavLink>
          <NavLink to="/organizer/dashboard" className={({ isActive }) => isActive ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"}>
            Organizer
          </NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || <FiUser />}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">{user?.name}</span>
                <FiChevronDown className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white py-2 shadow-lg">
                    <div className="border-b border-slate-100 px-4 pb-2 mb-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {user?.role}
                      </span>
                    </div>
                    <Link
                      to={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <FiUser className="text-base" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut className="text-base" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button variant="primary">
                <FiUser className="mr-2 inline" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
