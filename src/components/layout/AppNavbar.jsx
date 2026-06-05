// src/components/layout/AppNavbar.jsx
// Shared top navbar for all dashboard pages (Seller, Customer, Admin)

import { Link } from "react-router-dom";
import { FiBell, FiChevronDown } from "react-icons/fi";

export default function AppNavbar({
  title,
  subtitle,
  userName = "Rahul Sharma",
  userRole = "Seller",
  notifCount = 2,
  avatarLetter = "R",
  avatarSrc = null,
}) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Logo + Title */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          {/* House icon SVG */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="8" fill="#F5F0FF"/>
            <path d="M18 8L6 18H9V28H16V22H20V28H27V18H30L18 8Z" fill="#6d35f5"/>
            <path d="M18 8L6 18H9V28H16V22H20V28H27V18H30L18 8Z" fill="#6d35f5" opacity="0.2"/>
          </svg>
          <div>
            <p className="text-sm font-black leading-none tracking-[0.2em] text-ink-900">1CRORE</p>
            <p className="text-[9px] tracking-[0.35em] text-slate-400">PROPERTY</p>
          </div>
        </Link>

        {title && (
          <>
            <div className="mx-2 h-8 w-px bg-slate-200" />
            <div>
              <p className="font-black text-ink-900 leading-tight">{title}</p>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </>
        )}
      </div>

      {/* Right: Bell + User */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
          <FiBell className="text-lg" />
          {notifCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notifCount}
            </span>
          )}
        </button>

        {/* User */}
        <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50">
          {avatarSrc ? (
            <img src={avatarSrc} alt={userName} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {avatarLetter}
            </div>
          )}
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold text-ink-900">{userName}</p>
            <p className="text-xs text-slate-400">{userRole}</p>
          </div>
          <FiChevronDown className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}
