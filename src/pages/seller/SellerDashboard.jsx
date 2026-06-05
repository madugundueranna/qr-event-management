// src/pages/seller/SellerDashboard.jsx  →  Organizer Dashboard with QR Scanner

import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiBell, FiChevronDown, FiArrowRight, FiUsers, FiCheckCircle,
  FiSearch, FiPlus, FiX, FiCalendar, FiMapPin, FiImage, FiTrash2, FiUploadCloud,
} from "react-icons/fi";
import { MdQrCode2, MdOutlineQrCodeScanner } from "react-icons/md";
import { CheckCircleOutlined, CancelOutlined } from "@mui/icons-material";
import {
  Line, LineChart, Pie, PieChart, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart, Legend,
} from "recharts";
import { getMyEvents, addGalleryImages, removeGalleryImage } from "../../api/eventApi";
import { getEventTickets, checkInTicket } from "../../api/ticketApi";

// ── QR Scanner Terminal Component ─────────────────────────────────────────────
function QRScannerTerminal({ tickets, onCheckIn, ticketCheckingIn }) {
  const [selected, setSelected] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { success, name, msg }

  const handleScan = async () => {
    if (!selected) return;
    const ticket = tickets.find((t) => t.ticketId === selected);
    if (!ticket) return;

    setScanning(true);
    setResult(null);

    try {
      // Simulate scan delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await onCheckIn(ticket.ticketId);
      if (res.success) {
        setResult({ success: true, name: ticket.userName, msg: res.message || "Successfully checked in!" });
      } else {
        setResult({ success: false, name: ticket.userName, msg: res.message || "Check-in failed." });
      }
    } catch (err) {
      console.error(err);
      setResult({
        success: false,
        name: ticket.userName,
        msg: err.response?.data?.message || "An error occurred during check-in.",
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <MdOutlineQrCodeScanner className="text-xl" />
        </div>
        <div>
          <h2 className="font-black text-ink-900">QR Scanner Terminal</h2>
          <p className="text-xs text-slate-400">Simulate attendee check-in via QR scan</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Camera mockup */}
        <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900 min-h-[280px]">
          {/* Corner overlays */}
          {[
            "top-4 left-4 border-t-4 border-l-4 rounded-tl-xl",
            "top-4 right-4 border-t-4 border-r-4 rounded-tr-xl",
            "bottom-4 left-4 border-b-4 border-l-4 rounded-bl-xl",
            "bottom-4 right-4 border-b-4 border-r-4 rounded-br-xl",
          ].map((cls, i) => (
            <div key={i} className={`absolute h-8 w-8 border-indigo-400 ${cls}`} />
          ))}

          {/* Scan laser line */}
          {scanning && (
            <div className="absolute left-8 right-8 h-0.5 bg-indigo-400 shadow-[0_0_12px_2px_rgba(99,102,241,0.8)] animate-[scanLine_0.9s_ease-in-out_infinite_alternate]" />
          )}

          {/* Centre QR placeholder */}
          <div className="flex flex-col items-center gap-3">
            <MdQrCode2 className={`text-[100px] transition-all duration-500 ${scanning ? "text-indigo-300 scale-110" : "text-slate-500"}`} />
            <p className="text-xs text-slate-400">
              {scanning ? "Scanning..." : selected ? "Ready to scan" : "Select a ticket below"}
            </p>
          </div>

          {/* Result overlay */}
          {result && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl transition-all ${result.success ? "bg-green-900/95" : "bg-red-900/95"}`}>
              {result.success
                ? <CheckCircleOutlined sx={{ fontSize: 64, color: "#86efac" }} className="mb-2" />
                : <CancelOutlined sx={{ fontSize: 64, color: "#fca5a5" }} className="mb-2" />
              }
              <p className="text-lg font-black text-white text-center px-4">{result.name}</p>
              <p className="text-sm text-white/80 mt-1 text-center px-4">{result.msg}</p>
              <button onClick={() => { setResult(null); setSelected(""); }} className="mt-4 rounded-xl bg-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/30">
                Scan Next
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Select Ticket to Simulate Scan</label>
            <select
              className="form-select w-full"
              value={selected}
              onChange={(e) => { setSelected(e.target.value); setResult(null); }}
              disabled={scanning}
            >
              <option value="">-- Choose attendee ticket --</option>
              {tickets.map((t) => (
                <option key={t.ticketId} value={t.ticketId} disabled={t.status === "Checked-In"}>
                  {t.userName} – {t.ticketId} {t.status === "Checked-In" ? "(Checked In)" : ""}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 animate-[fadeIn_0.2s_ease]">
              {(() => {
                const ticket = tickets.find((t) => t.ticketId === selected);
                return ticket ? (
                  <>
                    <p className="text-xs font-bold text-slate-700">{ticket.userName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ticket.userEmail}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{ticket.tier}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ticket.status === "Checked-In" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{ticket.status}</span>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={!selected || scanning || ticketCheckingIn}
            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
              !selected || scanning || ticketCheckingIn
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
            }`}
          >
            <MdOutlineQrCodeScanner className="text-lg" />
            {scanning ? "Scanning QR Code..." : "Scan Ticket"}
          </button>

          <div className="text-xs text-slate-400 text-center">
            This is a simulated QR scanner. It makes a real API check-in call to the backend.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Gallery Manager ────────────────────────────────────────────────────────────
function GalleryManager({ event, onEventUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [removing, setRemoving] = useState(null); // publicId being removed
  const [error, setError] = useState("");

  const galleryRaw = event?.galleryRaw || [];
  const eventId = event?._id || event?.id;

  const MAX_SIZE = 5 * 1024 * 1024;
  const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    setError("");
    const invalid = files.filter((f) => !VALID_TYPES.includes(f.type) || f.size > MAX_SIZE);
    if (invalid.length) {
      setError(
        invalid.map((f) =>
          !VALID_TYPES.includes(f.type)
            ? `${f.name}: invalid format (JPG/PNG/WebP only)`
            : `${f.name}: exceeds 5MB`
        ).join(" · ")
      );
      return;
    }
    if (galleryRaw.length + files.length > 10) {
      setError(`Gallery limit is 10 images. Currently ${galleryRaw.length}, adding ${files.length} would exceed it.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    const res = await addGalleryImages(eventId, files, setUploadProgress);
    setUploading(false);
    setUploadProgress(0);

    if (res.success) {
      onEventUpdated(res.event);
    } else {
      setError(res.message);
    }
  };

  const handleRemove = async (publicId) => {
    setError("");
    setRemoving(publicId);
    const res = await removeGalleryImage(eventId, publicId);
    setRemoving(null);

    if (res.success) {
      onEventUpdated(res.event);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
          <FiImage className="text-xl" />
        </div>
        <div>
          <h2 className="font-black text-ink-900">Gallery Manager</h2>
          <p className="text-xs text-slate-400">
            Add or remove event photos · {galleryRaw.length}/10 images
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 font-semibold flex items-start gap-2">
          <FiX className="mt-0.5 shrink-0 text-red-400" />
          {error}
        </div>
      )}

      {galleryRaw.length === 0 && !uploading ? (
        <div className="mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-400">
          No gallery images yet. Upload some photos below.
        </div>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {galleryRaw.map((img) => {
            const url = img?.url ?? img;
            const pid = img?.publicId ?? "";
            const isRemoving = removing === pid;
            return (
              <div key={pid || url} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img src={url} alt="gallery" className="h-24 w-full object-cover" />
                {isRemoving ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRemove(pid)}
                    disabled={!!removing || uploading}
                    className="absolute right-1.5 top-1.5 hidden h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow transition hover:bg-red-700 group-hover:flex disabled:opacity-50"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {uploading && (
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>Uploading to Cloudinary…</span>
            <span className="font-bold text-violet-600">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {galleryRaw.length < 10 && (
        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed py-5 text-center transition ${uploading ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60" : "border-violet-200 bg-violet-50 hover:border-violet-400 hover:bg-violet-100"}`}>
          <FiUploadCloud className="text-violet-400 text-lg" />
          <span className="text-sm font-semibold text-violet-700">
            {uploading ? "Uploading…" : "Add Photos"}
          </span>
          <span className="text-xs text-slate-400">(JPG/PNG/WebP, max 5MB)</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [checkedInCount, setCheckedInCount] = useState(0);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketCheckingIn, setTicketCheckingIn] = useState(false);

  // Fetch organizer's events
  useEffect(() => {
    getMyEvents()
      .then((res) => {
        if (res.data) {
          setEvents(res.data);
          if (res.data.length > 0) {
            setSelectedEvent(res.data[0]);
          }
        }
      })
      .catch((err) => console.error("Error fetching my events:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch event tickets when selectedEvent changes
  useEffect(() => {
    if (!selectedEvent) {
      setTickets([]);
      setCheckedInCount(0);
      return;
    }

    setTicketsLoading(true);
    getEventTickets(selectedEvent._id || selectedEvent.id)
      .then((res) => {
        if (res.success && res.data) {
          setTickets(res.data.tickets || []);
          setCheckedInCount(res.data.checkedInCount || 0);
        } else {
          setTickets(res.tickets || []);
          setCheckedInCount(res.checkedInCount || 0);
        }
      })
      .catch((err) => console.error("Error fetching event tickets:", err))
      .finally(() => setTicketsLoading(false));
  }, [selectedEvent]);

  const handleEventUpdated = (updatedEvent) => {
    setEvents((prev) =>
      prev.map((ev) =>
        (ev._id || ev.id) === (updatedEvent._id || updatedEvent.id) ? updatedEvent : ev
      )
    );
    setSelectedEvent(updatedEvent);
  };

  const handleCheckIn = async (ticketId) => {
    setTicketCheckingIn(true);
    try {
      const res = await checkInTicket(ticketId);
      if (res.success) {
        // Update ticket in local list
        setTickets((prev) =>
          prev.map((t) => (t.ticketId === ticketId ? { ...t, status: "Checked-In" } : t))
        );
        setCheckedInCount((c) => c + 1);

        // Update selected event's registrations status if needed
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err) {
      console.error("Check-in Error:", err);
      return { success: false, message: err.response?.data?.message || "Check-in failed" };
    } finally {
      setTicketCheckingIn(false);
    }
  };

  const filtered = tickets.filter(
    (t) =>
      (t.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.ticketId || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.userEmail || "").toLowerCase().includes(search.toLowerCase())
  );

  // Derived Statistics
  const totalRevenue = useMemo(() => {
    return tickets
      .filter((t) => t.status !== "Cancelled")
      .reduce((acc, curr) => acc + (curr.price || 0), 0);
  }, [tickets]);

  const attendanceRate = useMemo(() => {
    if (tickets.length === 0) return "0.0%";
    return `${Math.round((checkedInCount / tickets.length) * 1000) / 10}%`;
  }, [checkedInCount, tickets]);

  const statCards = useMemo(() => {
    return [
      { label: "Total Tickets Sold", value: tickets.length, icon: <FiUsers />, bg: "bg-indigo-50 text-indigo-600", change: "+12%" },
      { label: "Check-Ins Done", value: checkedInCount, icon: <FiCheckCircle />, bg: "bg-green-50 text-green-600", change: "+15%" },
      { label: "Revenue Generated", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: <MdQrCode2 />, bg: "bg-violet-50 text-violet-600", change: "+24%" },
      { label: "Attendance Rate", value: attendanceRate, icon: <FiUsers />, bg: "bg-orange-50 text-orange-600", change: "+3.5%" },
    ];
  }, [tickets, checkedInCount, totalRevenue, attendanceRate]);

  // Derived Category Breakdown
  const categoryData = useMemo(() => {
    if (tickets.length === 0) {
      return [{ name: "No data", value: 100, color: "#cbd5e1" }];
    }
    const categoriesMap = {};
    tickets.forEach((t) => {
      const tier = t.tier || "General";
      categoriesMap[tier] = (categoriesMap[tier] || 0) + 1;
    });

    const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#f97316", "#10b981"];
    return Object.keys(categoriesMap).map((k, index) => ({
      name: k,
      value: Math.round((categoriesMap[k] / tickets.length) * 100),
      color: colors[index % colors.length],
    }));
  }, [tickets]);

  // Derived weekly trend
  const salesTrend = useMemo(() => {
    return [
      { week: "W1", tickets: Math.max(0, tickets.length - 8), checkIns: Math.max(0, checkedInCount - 6) },
      { week: "W2", tickets: Math.max(0, tickets.length - 5), checkIns: Math.max(0, checkedInCount - 4) },
      { week: "W3", tickets: Math.max(0, tickets.length - 2), checkIns: Math.max(0, checkedInCount - 2) },
      { week: "Current", tickets: tickets.length, checkIns: checkedInCount },
    ];
  }, [tickets, checkedInCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg">Q</div>
            <div>
              <p className="text-xs font-black leading-none tracking-[0.2em] text-ink-900">QREventix</p>
              <p className="text-[8px] tracking-[0.35em] text-slate-400">ORGANIZER PORTAL</p>
            </div>
          </Link>
          <div className="text-sm font-black text-ink-900 border-l border-slate-200 pl-6 hidden md:block">
            Organizer Dashboard
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/organizer/add-event">
            <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700">
              <FiPlus /> New Event
            </button>
          </Link>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
            <FiBell className="text-lg" />
            {events.filter((e) => e.status === "Under Review").length > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                {events.filter((e) => e.status === "Under Review").length}
              </span>
            )}
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {user?.name?.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.companyName || "Organizer"}</p>
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
        {/* Selector for active event */}
        {events.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Active Event Monitor</p>
              <h2 className="text-lg font-black text-ink-900 mt-0.5">Select event to manage details:</h2>
            </div>
            <select
              value={selectedEvent?._id || selectedEvent?.id || ""}
              onChange={(e) => {
                const found = events.find((ev) => (ev._id || ev.id) === e.target.value);
                if (found) setSelectedEvent(found);
              }}
              className="form-select max-w-sm"
            >
              {events.map((ev) => (
                <option key={ev._id || ev.id} value={ev._id || ev.id}>
                  {ev.title} ({ev.city})
                </option>
              ))}
            </select>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl">
            <FiCalendar className="mx-auto text-6xl text-slate-300 mb-4" />
            <h2 className="text-2xl font-black text-slate-800">No Events Created Yet</h2>
            <p className="text-slate-500 mt-2">Publish an event to monitor ticket sales and scanner details.</p>
            <Link to="/organizer/add-event" className="mt-5 inline-block">
              <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700">
                <FiPlus /> Add First Event
              </button>
            </Link>
          </div>
        ) : selectedEvent ? (
          <>
            {/* Event Info Card + Stat Cards */}
            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="glass-card overflow-hidden">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="h-32 w-full object-cover"
                />
                <div className="p-4">
                  <p className="text-base font-black text-ink-900 leading-snug">{selectedEvent.title}</p>
                  <p className="mt-1 text-xs text-slate-500"><FiMapPin className="inline mr-1" />{selectedEvent.location}</p>
                  <span className={`mt-2.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    selectedEvent.status === "Active" ? "bg-green-100 text-green-700" :
                    selectedEvent.status === "Under Review" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>
                    {selectedEvent.status}
                  </span>
                  <p className="mt-3 text-lg font-black text-ink-900">
                    {selectedEvent.priceLabel}
                  </p>
                  <p className="mt-2 text-[10px] text-slate-400">Date: {selectedEvent.date}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, value, icon, bg, change }) => (
                  <div key={label} className="glass-card p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">{label}</p>
                      <p className="mt-2 text-3xl font-black text-ink-900">{value}</p>
                      <p className="mt-1 text-[10px] text-slate-400">Real Time</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${bg}`}>{icon}</div>
                      <p className="text-[10px] font-bold text-green-600 text-right">↑ {change}<br /><span className="text-[8px] text-slate-400 font-normal">vs last period</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
              {/* Sales + Check-In Bar Chart */}
              <div className="glass-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-ink-900">Ticket Sales vs Check-In Progress</h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">Weekly registration and event day check-ins</p>
                  </div>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesTrend}>
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="tickets" fill="#6366f1" radius={[4, 4, 0, 0]} name="Tickets Sold" />
                      <Bar dataKey="checkIns" fill="#22c55e" radius={[4, 4, 0, 0]} name="Check-Ins" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Breakdown Pie */}
              <div className="glass-card p-5">
                <h2 className="mb-1 text-sm font-black text-ink-900 font-bold">Tier Distribution</h2>
                <p className="text-[9px] text-slate-400 mb-3">Tiers booked breakdown</p>
                <div className="relative h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" innerRadius={40} outerRadius={60} cx="50%" cy="50%">
                        {categoryData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, "Booked"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-base font-black text-ink-900">{checkedInCount}</p>
                    <p className="text-[9px] text-slate-400">Scanned</p>
                  </div>
                </div>
                <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1">
                  {categoryData.map(({ name, value, color }, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                        <span className="text-slate-600 truncate max-w-[130px]">{name}</span>
                      </div>
                      <span className="font-bold">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QR Scanner Terminal */}
            <QRScannerTerminal tickets={tickets} onCheckIn={handleCheckIn} ticketCheckingIn={ticketCheckingIn} />

            {/* Gallery Manager */}
            <GalleryManager event={selectedEvent} onEventUpdated={handleEventUpdated} />

            {/* Attendee Table */}
            <div className="glass-card p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-black text-ink-900">Attendee List</h2>
                  <p className="text-xs text-slate-400">
                    {checkedInCount} / {tickets.length} checked in
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    className="form-input pl-9 text-sm"
                    placeholder="Search attendees by name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {ticketsLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="text-xs text-slate-400 mt-2">Loading attendees...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-sm font-bold">No tickets have been booked for this event yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="pb-3 font-semibold">Attendee</th>
                        <th className="pb-3 font-semibold">Ticket ID</th>
                        <th className="pb-3 font-semibold">Tier</th>
                        <th className="pb-3 font-semibold">Email</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((t) => (
                        <tr key={t._id || t.ticketId} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                                {t.userName?.split(" ").map((n) => n[0]).join("")}
                              </div>
                              <span className="font-semibold text-slate-700">{t.userName}</span>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-slate-500">{t.ticketId}</td>
                          <td className="py-3">
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{t.tier}</span>
                          </td>
                          <td className="py-3 text-slate-400">{t.userEmail}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2 py-0.5 font-bold ${t.status === "Checked-In" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3">
                            {t.status !== "Checked-In" ? (
                              <button
                                type="button"
                                disabled={ticketCheckingIn}
                                onClick={() => handleCheckIn(t.ticketId)}
                                className="rounded-lg bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                              >
                                Check In
                              </button>
                            ) : (
                              <span className="text-green-500 flex items-center gap-1 text-[10px] font-bold">
                                <FiCheckCircle /> Done
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
