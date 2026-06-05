// src/pages/public/CustomerDashboard.jsx  →  AttendeeDashboard

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { useAuth } from "../../context/AuthContext";
import {
  FiBell, FiChevronDown, FiHeart, FiSearch, FiEye,
  FiArrowRight, FiCalendar, FiMapPin, FiX, FiCheckCircle,
  FiDownload, FiShare2,
} from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import { LockOutlined, BoltOutlined, HowToRegOutlined, CheckCircleOutlined, ConfirmationNumberOutlined, WavingHandOutlined } from "@mui/icons-material";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getEvents } from "../../api/eventApi";
import { getMyTickets } from "../../api/ticketApi";
import { getUserFavorites } from "../../api/favoriteApi";

// ── Canvas helpers (shared with download) ────────────────────────────────────
function roundRectDash(ctx, x, y, w, h, r) {
  const rad = typeof r === "number" ? { tl: r, tr: r, bl: r, br: r } : r;
  ctx.beginPath();
  ctx.moveTo(x + rad.tl, y);
  ctx.lineTo(x + w - rad.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad.tr);
  ctx.lineTo(x + w, y + h - rad.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad.br, y + h);
  ctx.lineTo(x + rad.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad.bl);
  ctx.lineTo(x, y + rad.tl);
  ctx.quadraticCurveTo(x, y, x + rad.tl, y);
  ctx.closePath();
}

function wrapTextDash(ctx, text, x, y, maxWidth, lineHeight) {
  const words = (text || "").split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

// ── QR Ticket Modal ──────────────────────────────────────────────────────────
function QRTicketModal({ ticket, onClose }) {
  const isCheckedIn = ticket.status === "Checked-In";
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Encode scanToken in QR — fall back to ticketId for legacy tickets
  const qrContent = ticket.scanToken || ticket.ticketId;

  useEffect(() => {
    if (!qrContent) return;
    QRCode.toDataURL(qrContent, {
      width: 200,
      margin: 2,
      color: isCheckedIn
        ? { dark: "#16a34a", light: "#f0fdf4" }
        : { dark: "#3730a3", light: "#eef2ff" },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [qrContent, isCheckedIn]);

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${ticket.eventId}`;
    const shareData = {
      title: ticket.eventTitle,
      text: `I'm attending ${ticket.eventTitle} on ${ticket.eventDate} at ${ticket.eventVenue}! Join me.`,
      url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!qrDataUrl) return;
    setDownloading(true);

    try {
      const W = 480, H = 680;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");

      // White background
      ctx.fillStyle = "#ffffff";
      roundRectDash(ctx, 0, 0, W, H, 24);
      ctx.fill();

      // Gradient header
      const grad = ctx.createLinearGradient(0, 0, W, 180);
      if (isCheckedIn) {
        grad.addColorStop(0, "#16a34a");
        grad.addColorStop(1, "#059669");
      } else {
        grad.addColorStop(0, "#4f46e5");
        grad.addColorStop(1, "#7c3aed");
      }
      ctx.fillStyle = grad;
      roundRectDash(ctx, 0, 0, W, 180, { tl: 24, tr: 24, bl: 0, br: 0 });
      ctx.fill();

      // Status label
      ctx.fillStyle = isCheckedIn ? "#bbf7d0" : "#a5b4fc";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(isCheckedIn ? "CHECKED IN" : "BOOKING CONFIRMED", 24, 44);

      // Event title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px sans-serif";
      wrapTextDash(ctx, ticket.eventTitle || "", 24, 76, W - 48, 28);

      // Date & venue
      ctx.fillStyle = isCheckedIn ? "#bbf7d0" : "#c7d2fe";
      ctx.font = "14px sans-serif";
      ctx.fillText(`${ticket.eventDate}  ·  ${ticket.eventTime}`, 24, 130);
      ctx.fillText(ticket.eventVenue || "", 24, 152);

      // Tear line
      ctx.strokeStyle = "#e2e8f0";
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 190);
      ctx.lineTo(W, 190);
      ctx.stroke();
      ctx.setLineDash([]);

      // QR code image — wait for it to load
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => { qrImg.onload = resolve; });
      const qrSize = 180;
      ctx.drawImage(qrImg, (W - qrSize) / 2, 210, qrSize, qrSize);

      // Ticket ID (human-readable, not the scanToken)
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(ticket.ticketId, W / 2, 415);
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Scan this QR code at the venue entrance", W / 2, 434);
      ctx.textAlign = "left";

      // Detail boxes
      const boxY = 460;
      const boxH = 64;
      const halfW = (W - 60) / 2;

      // Tier box
      ctx.fillStyle = "#f8fafc";
      roundRectDash(ctx, 24, boxY, halfW, boxH, 12);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("TIER", 38, boxY + 20);
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(ticket.tier || "General", 38, boxY + 42);

      // Amount box
      ctx.fillStyle = "#f8fafc";
      roundRectDash(ctx, 36 + halfW, boxY, halfW, boxH, 12);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("AMOUNT PAID", 50 + halfW, boxY + 20);
      ctx.fillStyle = "#4f46e5";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(ticket.priceLabel || "Free", 50 + halfW, boxY + 42);

      // Status bar
      ctx.fillStyle = isCheckedIn ? "#f0fdf4" : "#f0fdf4";
      roundRectDash(ctx, 24, boxY + boxH + 12, W - 48, 52, 12);
      ctx.fill();
      ctx.fillStyle = "#16a34a";
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("STATUS", 48, boxY + boxH + 33);
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(
        isCheckedIn ? "Checked In at Venue" : "Registered · Awaiting Check-In",
        48,
        boxY + boxH + 52
      );

      const link = document.createElement("a");
      link.download = `${ticket.ticketId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-[fadeInUp_0.2s_ease]">
        {/* Header */}
        <div className={`relative p-6 text-white bg-gradient-to-br ${isCheckedIn ? "from-green-500 to-emerald-600" : "from-indigo-600 to-violet-700"}`}>
          <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/40">
            <FiX />
          </button>
          <div className="flex items-center gap-2 text-sm font-semibold mb-2 opacity-80">
            {isCheckedIn ? <><FiCheckCircle /> Checked In!</> : <><MdQrCode2 /> QR Ticket</>}
          </div>
          <h2 className="text-lg font-black leading-tight">{ticket.eventTitle}</h2>
          <p className="mt-1 text-sm opacity-80"><FiCalendar className="inline mr-1" />{ticket.eventDate} · {ticket.eventTime}</p>
          <p className="text-sm opacity-80"><FiMapPin className="inline mr-1" />{ticket.eventVenue}</p>
        </div>

        {/* Tear line */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50">
          <div className="h-4 w-4 -ml-6 rounded-full bg-white shadow" />
          <div className="flex-1 border-t-2 border-dashed border-slate-200" />
          <div className="h-4 w-4 -mr-6 rounded-full bg-white shadow" />
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          {/* QR code display */}
          <div className={`relative mx-auto mb-4 flex h-44 w-44 items-center justify-center rounded-2xl border-2 ${isCheckedIn ? "border-green-100 bg-green-50" : "border-indigo-100 bg-indigo-50"}`}>
            {qrDataUrl
              ? <img src={qrDataUrl} alt="QR Code" className={`h-40 w-40 rounded-xl ${isCheckedIn ? "opacity-30" : ""}`} />
              : <MdQrCode2 className={`text-[140px] ${isCheckedIn ? "text-green-600 opacity-30" : "text-indigo-700"}`} />
            }
            {isCheckedIn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <FiCheckCircle className="text-5xl text-green-500" />
                <p className="text-xs font-bold text-green-600 mt-1">SCANNED</p>
              </div>
            )}
          </div>

          <p className="font-mono text-sm font-bold tracking-widest text-slate-700">{ticket.ticketId}</p>
          <p className="mt-0.5 text-xs text-slate-400">Scan this QR code at the venue entrance</p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] text-slate-400 font-semibold">TIER</p>
              <p className="text-sm font-bold text-slate-800">{ticket.tier}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] text-slate-400 font-semibold">AMOUNT PAID</p>
              <p className="text-sm font-bold text-indigo-700">{ticket.priceLabel}</p>
            </div>
            <div className={`col-span-2 rounded-xl p-3 flex items-center gap-2 ${isCheckedIn ? "bg-green-50" : "bg-indigo-50"}`}>
              {isCheckedIn ? <FiCheckCircle className="text-green-500 text-lg" /> : <MdQrCode2 className="text-indigo-500 text-lg" />}
              <div>
                <p className={`text-[10px] font-semibold ${isCheckedIn ? "text-green-600" : "text-indigo-600"}`}>STATUS</p>
                <p className={`text-sm font-bold ${isCheckedIn ? "text-green-700" : "text-indigo-700"}`}>
                  {isCheckedIn
                    ? <span className="flex items-center gap-1"><CheckCircleOutlined sx={{ fontSize: 15 }} /> Checked In at Venue</span>
                    : <span className="flex items-center gap-1"><ConfirmationNumberOutlined sx={{ fontSize: 15 }} /> Registered · Awaiting Check-In</span>
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition"
            >
              <FiShare2 /> {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!qrDataUrl || downloading}
              className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <FiDownload /> {downloading ? "Saving..." : "Download"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [eventsRes, ticketsRes, favoritesRes] = await Promise.all([
          getEvents({ limit: 6 }),
          getMyTickets(),
          getUserFavorites(),
        ]);
        if (eventsRes?.data) setEvents(eventsRes.data);
        if (ticketsRes?.tickets) setTickets(ticketsRes.tickets);
        if (favoritesRes?.favorites) setFavorites(favoritesRes.favorites);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Compute spending trend from real tickets
  const spendingTrend = useMemo(() => {
    // Group tickets by month-year
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySpend = {};

    // Initialize last 6 months
    const trendData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = months[d.getMonth()];
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlySpend[key] = { label, spend: 0 };
      trendData.push(key);
    }

    tickets.forEach((t) => {
      if (t.status === "Cancelled" || !t.createdDate) return;
      // parse YYYY-MM-DD
      const dateParts = t.createdDate.split(" ")[0].split("-");
      if (dateParts.length >= 2) {
        const key = `${dateParts[0]}-${dateParts[1]}`;
        if (monthlySpend[key]) {
          monthlySpend[key].spend += t.price || 0;
        }
      }
    });

    return trendData.map((k) => ({
      month: monthlySpend[k].label,
      spend: monthlySpend[k].spend,
    }));
  }, [tickets]);

  const quickStats = useMemo(() => {
    return [
      {
        icon: <FiCalendar />,
        bg: "bg-indigo-50 text-indigo-600",
        label: "My Tickets",
        value: tickets.length,
        sub: `${tickets.filter((t) => t.status === "Registered").length} active QR tickets`,
      },
      {
        icon: <FiHeart />,
        bg: "bg-red-50 text-red-500",
        label: "Saved Events",
        value: favorites.length,
        sub: "Events on wishlist",
      },
      {
        icon: <FiSearch />,
        bg: "bg-green-50 text-green-600",
        label: "Spent Overall",
        value: `₹${tickets.reduce((acc, curr) => acc + (curr.price || 0), 0).toLocaleString("en-IN")}`,
        sub: "Total ticket booking cost",
      },
      {
        icon: <FiEye />,
        bg: "bg-blue-50 text-blue-600",
        label: "Check-Ins Done",
        value: tickets.filter((t) => t.status === "Checked-In").length,
        sub: "Attended events",
      },
    ];
  }, [tickets, favorites]);

  const recentActivity = useMemo(() => {
    const acts = [];
    tickets.slice(0, 3).forEach((t) => {
      acts.push({
        icon: <FiCalendar />,
        bg: "bg-indigo-100 text-indigo-600",
        text: "Ticket Booked",
        sub: t.eventTitle,
        time: t.createdDate ? t.createdDate.split(" ")[0] : "Just now",
      });
      if (t.status === "Checked-In") {
        acts.push({
          icon: <FiCheckCircle />,
          bg: "bg-green-100 text-green-600",
          text: "Checked-In successfully",
          sub: t.eventTitle,
          time: t.checkedInAt ? t.checkedInAt.split(" ")[0] : "Recently",
        });
      }
    });

    favorites.slice(0, 2).forEach((w) => {
      acts.push({
        icon: <FiHeart />,
        bg: "bg-red-100 text-red-500",
        text: "Saved to Wishlist",
        sub: w.title,
        time: "Saved",
      });
    });

    return acts.slice(0, 4);
  }, [tickets, favorites]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {activeTicket && <QRTicketModal ticket={activeTicket} onClose={() => setActiveTicket(null)} />}

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg">Q</div>
          <div>
            <p className="text-xs font-black leading-none tracking-[0.2em] text-ink-900">QREventix</p>
            <p className="text-[8px] tracking-[0.35em] text-slate-400">ATTENDEE PORTAL</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
            <FiBell className="text-lg" />
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">1</span>
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {user?.name?.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.role}</p>
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

      <main className="container-page py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* ── LEFT MAIN ── */}
          <div className="space-y-6">
            {/* Welcome + Quick Stats */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-2xl font-black text-ink-900 flex items-center gap-2">Welcome back, {user?.name} <WavingHandOutlined sx={{ fontSize: 24, color: "#f59e0b" }} /></h1>
                <p className="mt-1 text-sm text-slate-500">Discover and book events happening near you.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {quickStats.map(({ icon, bg, label, value, sub }) => (
                  <div key={label} className="glass-card flex flex-col p-4">
                    <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl text-base ${bg}`}>{icon}</div>
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="text-xl font-black text-ink-900">{value}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* My QR Tickets */}
            <div className="glass-card p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-ink-900">My QR Tickets</h2>
                  <p className="text-xs text-slate-500">Click any ticket to view your QR code</p>
                </div>
                <Link to="/events" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                  Browse Events <FiArrowRight className="text-[10px]" />
                </Link>
              </div>

              {tickets.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <MdQrCode2 className="mx-auto text-5xl mb-3 text-slate-300" />
                  <p className="text-sm font-bold">No tickets booked yet</p>
                  <Link to="/events" className="text-xs text-indigo-600 font-bold hover:underline mt-2 inline-block">
                    Book your first event ticket
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {tickets.map((ticket) => (
                    <button
                      type="button"
                      key={ticket._id}
                      onClick={() => setActiveTicket(ticket)}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-card hover:border-indigo-300"
                    >
                      <div className="relative h-28 overflow-hidden bg-slate-900">
                        {ticket.eventImage ? (
                          <img src={ticket.eventImage} alt={ticket.eventTitle} className="h-full w-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-white font-black">QREVENTIX</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className={`absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-black text-white ${ticket.status === "Checked-In" ? "bg-green-500" : "bg-indigo-600"}`}>
                          {ticket.status}
                        </span>
                        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
                          <MdQrCode2 className="text-indigo-700 text-lg" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-slate-800 text-sm leading-snug">{ticket.eventTitle}</p>
                        <p className="mt-1 text-xs text-slate-400 flex items-center gap-1"><FiCalendar className="text-indigo-400" /> {ticket.eventDate} · {ticket.eventTime}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><FiMapPin className="text-indigo-400" /> {ticket.eventVenue}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{ticket.tier}</span>
                          <span className="text-xs font-black text-indigo-700">{ticket.priceLabel}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700">
                <LockOutlined sx={{ fontSize: 20, color: "#4f46e5" }} />
                <div>
                  <p className="font-bold">All tickets are secured with unique QR codes.</p>
                  <p className="text-indigo-500">Show your QR at the venue for instant contactless check-in.</p>
                </div>
              </div>
            </div>

            {/* Recommended Events */}
            <div className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-ink-900">Recommended Events</h2>
                  <p className="text-xs text-slate-500">Handpicked events matching your interests</p>
                </div>
                <Link to="/events" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                  View All <FiArrowRight className="text-[10px]" />
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {events.slice(0, 3).map((ev) => (
                  <Link key={ev.id || ev._id} to={`/events/${ev.id || ev._id}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-card">
                    <div className="relative h-32 overflow-hidden bg-slate-900">
                      <img src={ev.image} alt={ev.title} className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white">{ev.type}</span>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-slate-800 text-xs truncate">{ev.title}</p>
                      <p className="mt-1 text-[10px] text-slate-400 truncate">{ev.date} · {ev.city}</p>
                      <p className="mt-1 text-xs font-black text-indigo-700">{ev.priceLabel}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-5">
            {/* Activity */}
            <div className="glass-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-black text-ink-900">Your Activity</h3>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((act, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${act.bg}`}>{act.icon}</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-700">{act.text}</p>
                        <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[150px]">{act.sub}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-400">{act.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Spending trend */}
            <div className="glass-card p-5">
              <h3 className="font-black text-ink-900 mb-1">Ticket Spending Trend</h3>
              <p className="text-[10px] text-slate-400 mb-3">Last 6 months</p>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spendingTrend}>
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip formatter={(v) => [`₹${v}`, "Spent"]} />
                    <Line dataKey="spend" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: <LockOutlined style={{ fontSize: 20 }} className="text-indigo-500" />, label: "Secure Tickets", sub: "QR encrypted & unique" },
                { icon: <BoltOutlined style={{ fontSize: 20 }} className="text-amber-500" />, label: "Instant Delivery", sub: "QR ticket in seconds" },
                { icon: <HowToRegOutlined style={{ fontSize: 20 }} className="text-green-500" />, label: "Easy Check-In", sub: "Contactless at venue" },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-soft">
                  <span>{icon}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{label}</p>
                    <p className="text-[10px] text-slate-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
