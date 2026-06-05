// src/pages/admin/AdminDashboard.jsx  →  QREventix Admin Dashboard (Live API)

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEvents, updateEventStatus } from "../../api/eventApi";
import { getUsers } from "../../api/userApi";
import {
  FiBarChart2, FiCalendar, FiCheckCircle, FiClock,
  FiMessageCircle, FiSettings, FiUsers, FiXCircle,
  FiBell, FiChevronDown, FiEye, FiMoreVertical,
  FiPlus, FiSearch, FiFileText, FiUserPlus, FiCheck, FiX, FiTag,
} from "react-icons/fi";
import { MdQrCode2, MdOutlineQrCodeScanner } from "react-icons/md";
import {
  Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";


const quickActions = [
  { label: "Add Event",       icon: <FiPlus />,                 color: "bg-indigo-50 text-indigo-600",  to: "/organizer/add-event" },
  { label: "Review Events",   icon: <FiSearch />,               color: "bg-orange-50 text-orange-600",  to: "/admin/properties" },
  { label: "Manage Users",    icon: <FiUserPlus />,             color: "bg-green-50 text-green-600",    to: "/admin/users" },
  { label: "QR Check-Ins",    icon: <MdOutlineQrCodeScanner />, color: "bg-violet-50 text-violet-600",  to: "/organizer/dashboard" },
  { label: "Page Content",    icon: <FiFileText />,             color: "bg-blue-50 text-blue-600",      to: "/admin/content" },
  { label: "Form Submissions",icon: <FiMessageCircle />,        color: "bg-rose-50 text-rose-600",      to: "/admin/submissions" },
  { label: "Analytics",       icon: <FiBarChart2 />,            color: "bg-amber-50 text-amber-600",    to: "/admin/reports" },
  { label: "Cities & Types",  icon: <FiTag />,                  color: "bg-teal-50 text-teal-600",      to: "/admin/categories" },
];

const STATUS_STYLES = {
  "Active":       "bg-green-100 text-green-700",
  "Under Review": "bg-orange-100 text-orange-700",
  "Rejected":     "bg-red-100 text-red-700",
  "Completed":    "bg-slate-100 text-slate-600",
};

const PIE_COLORS = {
  "Active":       "#6366f1",
  "Under Review": "#f97316",
  "Completed":    "#22c55e",
  "Rejected":     "#ef4444",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const [allEvents, setAllEvents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch all events (admin sees all statuses)
  const fetchEvents = () => {
    setLoadingEvents(true);
    getEvents({ status: "All", limit: 200 })
      .then((res) => setAllEvents(res.data || []))
      .catch((err) => console.error("Failed to fetch events:", err))
      .finally(() => setLoadingEvents(false));
  };

  useEffect(() => {
    fetchEvents();
    setLoadingUsers(true);
    getUsers()
      .then((res) => setAllUsers(res.users || []))
      .catch((err) => console.error("Failed to fetch users:", err))
      .finally(() => setLoadingUsers(false));
  }, []);

  // Derived stats from real data
  const statCards = useMemo(() => {
    const total     = allEvents.length;
    const active    = allEvents.filter((e) => e.status === "Active").length;
    const pending   = allEvents.filter((e) => e.status === "Under Review").length;
    const rejected  = allEvents.filter((e) => e.status === "Rejected").length;
    const totalUsers = allUsers.length;
    const organizers = allUsers.filter((u) => u.role === "Organizer").length;

    return [
      { icon: <FiCalendar />,            label: "Total Events",      value: total,          color: "bg-indigo-50 text-indigo-600",  positive: true,  change: "+12.4%" },
      { icon: <FiCheckCircle />,         label: "Active Events",     value: active,         color: "bg-green-50 text-green-600",    positive: true,  change: "+10.3%" },
      { icon: <FiClock />,               label: "Under Review",      value: pending,        color: "bg-orange-50 text-orange-600",  positive: true,  change: "+4.2%"  },
      { icon: <FiXCircle />,             label: "Rejected",          value: rejected,       color: "bg-red-50 text-red-500",        positive: false, change: "-6.7%"  },
      { icon: <FiUsers />,               label: "Total Users",       value: totalUsers,     color: "bg-blue-50 text-blue-600",      positive: true,  change: "+8.3%"  },
      { icon: <MdQrCode2 />,             label: "Organizers",        value: organizers,     color: "bg-violet-50 text-violet-600",  positive: true,  change: "+11.2%" },
    ];
  }, [allEvents, allUsers]);

  // Pie data from real event statuses
  const pieData = useMemo(() => {
    const groups = {};
    allEvents.forEach((e) => {
      groups[e.status] = (groups[e.status] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({
      name,
      value,
      pct: allEvents.length > 0 ? `${((value / allEvents.length) * 100).toFixed(1)}%` : "0%",
      color: PIE_COLORS[name] || "#94a3b8",
    }));
  }, [allEvents]);

  // Recent events (latest 5)
  const recentEvents = useMemo(() => allEvents.slice(0, 5), [allEvents]);

  // Overview chart — group events by week of creation
  const overviewData = useMemo(() => {
    const weekMap = {};
    allEvents.forEach((e) => {
      const d = new Date(e.createdDate || e.date || Date.now());
      const week = `${d.getDate()} ${d.toLocaleString("en", { month: "short" })}`;
      if (!weekMap[week]) weekMap[week] = { date: week, events: 0, active: 0, tickets: 0, checkIns: 0 };
      weekMap[week].events++;
      if (e.status === "Active") weekMap[week].active++;
      weekMap[week].tickets += e.registered || 0;
    });
    const sorted = Object.values(weekMap).slice(-5);
    return sorted.length > 0 ? sorted : [{ date: "—", events: 0, active: 0, tickets: 0, checkIns: 0 }];
  }, [allEvents]);

  // Top locations — group events by city
  const topLocations = useMemo(() => {
    const cityMap = {};
    allEvents.forEach((e) => { if (e.city) cityMap[e.city] = (cityMap[e.city] || 0) + 1; });
    const total = Object.values(cityMap).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(cityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count, pct: parseFloat(((count / total) * 100).toFixed(1)) }));
  }, [allEvents]);

  const handleStatusUpdate = async (eventId, newStatus) => {
    setUpdatingId(eventId);
    try {
      const res = await updateEventStatus(eventId, newStatus);
      if (res.success || res.event) {
        fetchEvents();
      }
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
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
          <div>
            <p className="font-black text-ink-900 leading-tight">Admin Dashboard</p>
            <p className="text-xs text-slate-400">QREventix Platform Team</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
            <FiBell className="text-lg" />
            {allEvents.filter((e) => e.status === "Under Review").length > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {allEvents.filter((e) => e.status === "Under Review").length}
              </span>
            )}
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-ink-900">{user?.name || "Admin User"}</p>
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

      <main className="container-page py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {statCards.map(({ icon, label, value, change, positive, color }) => (
            <div key={label} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${color}`}>{icon}</div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-xl font-black text-ink-900">
                    {loadingEvents || loadingUsers ? "…" : value}
                  </p>
                  <p className={`text-[10px] font-semibold ${positive ? "text-green-600" : "text-red-500"}`}>
                    {positive ? "↑" : "↓"} {change} vs last month
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px_300px]">
          {/* Event Overview Area Chart */}
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-ink-900">Event & Check-In Overview</h2>
              <select className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600">
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overviewData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area dataKey="tickets"  stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} dot={false} name="Tickets" />
                  <Area dataKey="checkIns" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} dot={false} name="Check-Ins" />
                  <Area dataKey="events"   stroke="#f97316" fill="#ffedd5" strokeWidth={2} dot={false} name="Events" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie (live data) */}
          <div className="glass-card p-5">
            <h2 className="mb-4 font-black text-ink-900">Event Status Distribution</h2>
            <div className="relative h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData.length > 0 ? pieData : [{ name: "No data", value: 1, color: "#e2e8f0" }]}
                       dataKey="value" innerRadius={60} outerRadius={90} cx="50%" cy="50%">
                    {(pieData.length > 0 ? pieData : [{ color: "#e2e8f0" }]).map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-black text-ink-900">{allEvents.length}</p>
                <p className="text-xs text-slate-400">Total Events</p>
              </div>
            </div>
            <div className="mt-2 space-y-1.5">
              {pieData.map(({ name, value, pct, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-slate-600">{name}</span>
                  </div>
                  <span className="font-bold text-slate-700">{value} ({pct})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-5">
            <h2 className="mb-4 font-black text-ink-900">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, icon, color, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-3 text-center text-xs font-semibold text-slate-600 shadow-soft hover:border-indigo-200 hover:text-indigo-600 transition"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${color}`}>{icon}</div>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Events Table (live) + Activities */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Recent Events Table */}
          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black text-ink-900">Recent Events</h2>
              <Link to="/admin/properties" className="text-xs font-semibold text-indigo-600 hover:underline">
                View All →
              </Link>
            </div>
            {loadingEvents ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="pb-3 font-semibold">Event Title</th>
                      <th className="pb-3 font-semibold">Location</th>
                      <th className="pb-3 font-semibold">Price</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                          No events found.
                        </td>
                      </tr>
                    ) : recentEvents.map((ev) => (
                      <tr key={ev._id || ev.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {ev.image && (
                              <img src={ev.image} alt="" className="h-8 w-11 rounded-lg object-cover" />
                            )}
                            <span className="font-semibold text-slate-700 max-w-[180px] truncate">{ev.title}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-500">{ev.location}</td>
                        <td className="py-3 font-bold text-indigo-700">{ev.priceLabel || (ev.price > 0 ? `₹${ev.price}` : "Free")}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[ev.status] || "bg-slate-100 text-slate-600"}`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{ev.date}</td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            {ev.status === "Under Review" && (
                              <>
                                <button
                                  disabled={updatingId === (ev._id || ev.id)}
                                  onClick={() => handleStatusUpdate(ev._id || ev.id, "Active")}
                                  className="rounded-lg bg-green-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                  <FiCheck />
                                </button>
                                <button
                                  disabled={updatingId === (ev._id || ev.id)}
                                  onClick={() => handleStatusUpdate(ev._id || ev.id, "Rejected")}
                                  className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-600 disabled:opacity-50"
                                >
                                  <FiX />
                                </button>
                              </>
                            )}
                            <Link
                              to={`/events/${ev._id || ev.id}`}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                            >
                              <FiEye />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Top Cities */}
          <div className="space-y-5">
            <div className="glass-card p-5">
              <h2 className="mb-3 font-black text-ink-900">Top Cities by Events</h2>
              <div className="space-y-3">
                {topLocations.map(({ city, count, pct }) => (
                  <div key={city}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{city}</span>
                      <span className="text-slate-500">{count.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User breakdown */}
            <div className="glass-card p-5">
              <h2 className="mb-3 font-black text-ink-900">User Breakdown</h2>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { label: "Attendees (User)", role: "User",      color: "bg-indigo-500" },
                    { label: "Organizers",        role: "Organizer", color: "bg-violet-500" },
                    { label: "Admins",            role: "Admin",     color: "bg-orange-500" },
                  ].map(({ label, role, color }) => {
                    const count = allUsers.filter((u) => u.role === role).length;
                    const pct = allUsers.length > 0 ? (count / allUsers.length) * 100 : 0;
                    return (
                      <div key={role}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{label}</span>
                          <span className="text-slate-500">{count}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100">
                          <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <p className="pt-1 text-[10px] text-slate-400">Total: {allUsers.length} registered users</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-6 border-t border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
          <span>© 2026 QREventix. All rights reserved.</span>
          <span>Seamless QR Check-Ins. Premium Event Experiences.</span>
          <span>Version 2.0.0</span>
        </div>
      </footer>
    </div>
  );
}
