// src/pages/admin/AdminReports.jsx  →  QREventix Reports & Analytics (Live API)

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEvents } from "../../api/eventApi";
import { getUsers } from "../../api/userApi";
import {
  FiBell, FiChevronDown, FiBarChart2, FiUsers, FiCalendar, FiCheckCircle,
} from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import {
  Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";

// Static monthly trend (illustrative)
const monthlyData = [
  { month: "Nov", tickets: 820,  checkIns: 680,  revenue: 12 },
  { month: "Dec", tickets: 1240, checkIns: 1050, revenue: 24 },
  { month: "Jan", tickets: 1610, checkIns: 1380, revenue: 31 },
  { month: "Feb", tickets: 2040, checkIns: 1750, revenue: 42 },
  { month: "Mar", tickets: 2480, checkIns: 2100, revenue: 58 },
  { month: "Apr", tickets: 2950, checkIns: 2560, revenue: 71 },
  { month: "May", tickets: 3410, checkIns: 2980, revenue: 89 },
];

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#f97316", "#22c55e", "#ef4444", "#10b981"];

export default function AdminReports() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const [events, setEvents] = useState([]);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEvents({ status: "All", limit: 500 }),
      getUsers(),
    ])
      .then(([evRes, userRes]) => {
        setEvents(evRes.data || []);
        setUsers(userRes.users || []);
      })
      .catch((err) => console.error("Failed to load report data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Derived stats
  const stats = useMemo(() => {
    const total       = events.length;
    const active      = events.filter((e) => e.status === "Active").length;
    const pending     = events.filter((e) => e.status === "Under Review").length;
    const totalUsers  = users.length;
    const organizers  = users.filter((u) => u.role === "Organizer").length;

    return { total, active, pending, totalUsers, organizers };
  }, [events, users]);

  // City breakdown
  const cityData = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const city = e.city || "Other";
      map[city] = (map[city] || 0) + 1;
    });
    return Object.entries(map)
      .map(([city, count]) => ({ city, events: count }))
      .sort((a, b) => b.events - a.events)
      .slice(0, 8);
  }, [events]);

  // Event type breakdown for pie
  const typeData = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const type = e.type || "Other";
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [events]);

  const summaryCards = [
    { label: "Total Events",     value: stats.total,       icon: <FiCalendar />,   color: "bg-indigo-50 text-indigo-600",  change: "+12.4%" },
    { label: "Active Events",    value: stats.active,      icon: <FiCheckCircle />,color: "bg-green-50 text-green-600",    change: "+10.3%" },
    { label: "Under Review",     value: stats.pending,     icon: <FiBarChart2 />,  color: "bg-orange-50 text-orange-600",  change: "+4.2%"  },
    { label: "Total Users",      value: stats.totalUsers,  icon: <FiUsers />,      color: "bg-blue-50 text-blue-600",      change: "+8.3%"  },
    { label: "Organizers",       value: stats.organizers,  icon: <MdQrCode2 />,    color: "bg-violet-50 text-violet-600",  change: "+11.2%" },
    { label: "Scan Success Rate",value: "97.8%",           icon: <FiCheckCircle />,color: "bg-emerald-50 text-emerald-600",change: "+1.4%"  },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg">Q</div>
            <div>
              <p className="text-xs font-black leading-none tracking-[0.2em] text-ink-900">QREventix</p>
              <p className="text-[8px] tracking-[0.35em] text-slate-400">ADMIN</p>
            </div>
          </Link>
          <div className="mx-2 h-8 w-px bg-slate-200" />
          <p className="font-black text-ink-900 leading-tight hidden md:block">Reports & Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-xs font-semibold text-indigo-600 hover:underline hidden md:block">← Admin Dashboard</Link>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
            <FiBell className="text-lg" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-ink-900">{user?.name || "Admin"}</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>
              <FiChevronDown className="text-slate-400 text-xs" />
            </button>
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1 hidden group-hover:block z-[99]">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold disabled:opacity-50"
              >
                {loggingOut ? "Logging out…" : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-page py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-ink-900">Reports & Analytics</h1>
          <p className="mt-1 text-slate-500">
            Live platform performance overview — events, users, and registrations.
          </p>
        </div>

        {/* Summary Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
              {summaryCards.map(({ label, value, icon, color, change }) => (
                <div key={label} className="glass-card p-5">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl mb-3 ${color}`}>
                    {icon}
                  </div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-1 text-3xl font-black text-ink-900">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-green-600">↑ {change} vs prev period</p>
                </div>
              ))}
            </div>

            {/* Row 1: Monthly trend + Event type pie */}
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="glass-card p-6">
                <h2 className="text-xl font-black text-ink-900">Monthly Tickets & Check-Ins Trend</h2>
                <p className="text-xs text-slate-400 mt-0.5">Illustrative 7-month trend data</p>
                <div className="mt-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Area dataKey="tickets"  name="Tickets Sold" stroke="#6366f1" fill="#e0e7ff" strokeWidth={3} />
                      <Area dataKey="checkIns" name="Check-Ins"    stroke="#22c55e" fill="#dcfce7" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="text-xl font-black text-ink-900">Events by Category</h2>
                <p className="text-xs text-slate-400 mt-0.5">Live breakdown from {events.length} events</p>
                {typeData.length === 0 ? (
                  <div className="mt-6 text-center text-slate-400 py-10 text-sm font-semibold">No events yet</div>
                ) : (
                  <>
                    <div className="mt-6 h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={typeData} dataKey="value" innerRadius={55} outerRadius={90}>
                            {typeData.map((entry, i) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 space-y-2">
                      {typeData.map(({ name, value, color }) => (
                        <div key={name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ background: color }} />
                            <span className="text-slate-600">{name}</span>
                          </div>
                          <span className="font-bold text-slate-700">{value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Row 2: Events by City (live) */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-black text-ink-900">Events by City</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live data from database</p>
              {cityData.length === 0 ? (
                <div className="mt-6 text-center text-slate-400 py-10 text-sm font-semibold">No data available</div>
              ) : (
                <div className="mt-6 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityData}>
                      <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="events" name="Events" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Row 3: User role breakdown */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-black text-ink-900">User Role Distribution</h2>
              <p className="text-xs text-slate-400 mt-0.5">{users.length} total registered users</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { role: "User",      label: "Attendees",  color: "#6366f1" },
                  { role: "Organizer", label: "Organizers", color: "#8b5cf6" },
                  { role: "Admin",     label: "Admins",     color: "#f97316" },
                ].map(({ role, label, color }) => {
                  const count = users.filter((u) => u.role === role).length;
                  const pct   = users.length > 0 ? ((count / users.length) * 100).toFixed(1) : "0";
                  return (
                    <div key={role} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-4 w-4 rounded-full" style={{ background: color }} />
                        <p className="font-bold text-slate-700">{label}</p>
                      </div>
                      <p className="text-3xl font-black text-ink-900">{count}</p>
                      <p className="text-xs text-slate-400 mt-1">{pct}% of total users</p>
                      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
