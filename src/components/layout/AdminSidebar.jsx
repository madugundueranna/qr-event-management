// src/components/layout/AdminSidebar.jsx

import { NavLink } from "react-router-dom";
import {
  FiBarChart2,
  FiHome,
  FiList,
  FiLogOut,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

const navItems = [
  { label: "Dashboard", icon: <FiHome />, to: "/admin" },
  { label: "Properties", icon: <FiList />, to: "/admin/properties" },
  { label: "Users", icon: <FiUsers />, to: "/admin/users" },
  { label: "Reports", icon: <FiBarChart2 />, to: "/admin/reports" },
  { label: "Settings", icon: <FiSettings />, to: "/admin" },
];

export default function AdminSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6 border-b border-slate-100">
        <div className="text-3xl font-black text-gold-600">1C</div>
        <div>
          <p className="font-bold tracking-[0.3em] text-ink-900">1CRORE</p>
          <p className="text-[10px] tracking-[0.4em] text-slate-400">ADMIN PANEL</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ label, icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-primary-50 text-primary-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-ink-900"
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50">
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
}
