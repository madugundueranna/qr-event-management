// src/pages/public/PropertyDetails.jsx  →  EventDetails page with QR ticket booking

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import {
  FiCalendar, FiMapPin, FiUsers, FiTag, FiShare2, FiHeart,
  FiCheckCircle, FiX, FiDownload, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import QRCode from "qrcode";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import Button from "../../components/common/Button";
import { getEventById } from "../../api/eventApi";
import { bookTicket, createPaymentOrder, verifyPayment } from "../../api/ticketApi";
import {
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

// ── Canvas helpers ────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  const radii = typeof r === "number"
    ? { tl: r, tr: r, bl: r, br: r }
    : r;
  ctx.beginPath();
  ctx.moveTo(x + radii.tl, y);
  ctx.lineTo(x + w - radii.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radii.tr);
  ctx.lineTo(x + w, y + h - radii.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radii.br, y + h);
  ctx.lineTo(x + radii.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radii.bl);
  ctx.lineTo(x, y + radii.tl);
  ctx.quadraticCurveTo(x, y, x + radii.tl, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
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

// ── Gallery Lightbox ──────────────────────────────────────────────────────────
function GalleryLightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next, onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40"
      >
        <FiX size={20} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      <img
        src={images[current]}
        alt={`Gallery ${current + 1}`}
        className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <p className="absolute bottom-6 text-sm text-white/70">
          {current + 1} / {images.length}
        </p>
      )}
    </div>
  );
}

// ── QR Ticket Confirmation Modal ──────────────────────────────────────────────
function QRTicketModal({ event, ticketDetails, onClose }) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Encode scanToken in QR — never raw personal data
  const qrContent = ticketDetails.scanToken || ticketDetails.ticketId;

  useEffect(() => {
    QRCode.toDataURL(qrContent, {
      width: 200,
      margin: 2,
      color: { dark: "#3730a3", light: "#eef2ff" },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [qrContent]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: event.title,
      text: `I'm attending ${event.title} on ${event.date} at ${event.location}! Join me.`,
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

    const W = 480, H = 680;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // White card background
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 0, 0, W, H, 24);
    ctx.fill();

    // Indigo-to-violet gradient header
    const grad = ctx.createLinearGradient(0, 0, W, 180);
    grad.addColorStop(0, "#4f46e5");
    grad.addColorStop(1, "#7c3aed");
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, W, 180, { tl: 24, tr: 24, bl: 0, br: 0 });
    ctx.fill();

    // "Booking Confirmed!" label
    ctx.fillStyle = "#a5b4fc";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("BOOKING CONFIRMED", 24, 44);

    // Event title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    wrapText(ctx, event.title, 24, 76, W - 48, 28);

    // Date & venue
    ctx.fillStyle = "#c7d2fe";
    ctx.font = "14px sans-serif";
    ctx.fillText(`${event.date}  ·  ${event.time}`, 24, 130);
    ctx.fillText(event.location, 24, 152);

    // Dashed tear line
    ctx.strokeStyle = "#e2e8f0";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 190);
    ctx.lineTo(W, 190);
    ctx.stroke();
    ctx.setLineDash([]);

    // QR code image
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((res) => { qrImg.onload = res; });
    const qrSize = 180;
    const qrX = (W - qrSize) / 2;
    ctx.drawImage(qrImg, qrX, 210, qrSize, qrSize);

    // Ticket ID
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(ticketDetails.ticketId, W / 2, 415);
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
    roundRect(ctx, 24, boxY, halfW, boxH, 12);
    ctx.fill();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("TIER", 38, boxY + 20);
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(ticketDetails.tier, 38, boxY + 42);

    // Amount box
    ctx.fillStyle = "#f8fafc";
    roundRect(ctx, 36 + halfW, boxY, halfW, boxH, 12);
    ctx.fill();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("AMOUNT PAID", 50 + halfW, boxY + 20);
    ctx.fillStyle = "#4f46e5";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(ticketDetails.priceLabel || "Free", 50 + halfW, boxY + 42);

    // Status bar
    ctx.fillStyle = "#f0fdf4";
    roundRect(ctx, 24, boxY + boxH + 12, W - 48, 52, 12);
    ctx.fill();
    ctx.fillStyle = "#16a34a";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("STATUS", 48, boxY + boxH + 33);
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Registered · Awaiting Check-In", 48, boxY + boxH + 52);

    const link = document.createElement("a");
    link.download = `${ticketDetails.ticketId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md animate-[fadeInUp_0.3s_ease]">
        {/* Ticket card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* Gradient header */}
          <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/40"
            >
              <FiX />
            </button>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold mb-2">
              <FiCheckCircle className="text-green-300" /> Booking Confirmed!
            </div>
            <h2 className="text-xl font-black leading-tight">{event.title}</h2>
            <p className="mt-2 text-sm text-indigo-200">
              <FiCalendar className="inline mr-1" />{event.date} · {event.time}
            </p>
            <p className="text-sm text-indigo-200">
              <FiMapPin className="inline mr-1" />{event.location}
            </p>
          </div>

          {/* Ticket tear line */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50">
            <div className="h-4 w-4 -ml-6 rounded-full bg-white shadow" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200" />
            <div className="h-4 w-4 -mr-6 rounded-full bg-white shadow" />
          </div>

          {/* QR code + details */}
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-44 w-44 items-center justify-center rounded-2xl border-2 border-indigo-100 bg-indigo-50">
              {qrDataUrl
                ? <img src={qrDataUrl} alt="QR Code" className="h-40 w-40 rounded-xl" />
                : <MdQrCode2 className="text-[140px] text-indigo-700" />
              }
            </div>
            <p className="font-mono text-sm font-bold tracking-widest text-slate-700">{ticketDetails.ticketId}</p>
            <p className="mt-1 text-xs text-slate-400">Scan this QR code at the venue entrance</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400 font-semibold">TIER</p>
                <p className="text-sm font-bold text-slate-800">{ticketDetails.tier}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] text-slate-400 font-semibold">AMOUNT PAID</p>
                <p className="text-sm font-bold text-indigo-700">{ticketDetails.priceLabel}</p>
              </div>
              <div className="rounded-xl bg-green-50 p-3 col-span-2 flex items-center gap-2">
                <FiCheckCircle className="text-green-500 text-lg shrink-0" />
                <div>
                  <p className="text-[10px] text-green-600 font-semibold">STATUS</p>
                  <p className="text-sm font-bold text-green-700">Registered · Awaiting Check-In</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <FiShare2 className="mr-2 inline" /> {copied ? "Copied!" : "Share"}
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleDownload} disabled={!qrDataUrl || downloading}>
                <FiDownload className="mr-2 inline" /> {downloading ? "Saving..." : "Download"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Load Razorpay script dynamically ─────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ event, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);

  // Derive tiers dynamically
  const ticketTiers = event.tiers && event.tiers.length > 0
    ? event.tiers.map((t) => ({
        label: t.label,
        price: t.price,
        priceLabel: t.price > 0 ? `₹${t.price.toLocaleString("en-IN")}` : "Free",
        desc: `${t.label} entry pass`,
        available: event.registered < event.capacity,
      }))
    : [
        {
          label: "General Pass",
          price: event.price || 0,
          priceLabel: event.price > 0 ? `₹${event.price.toLocaleString("en-IN")}` : "Free",
          desc: "General admission pass",
          available: event.registered < event.capacity,
        },
      ];

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!selected) {
      setError("Please select a ticket tier.");
      return;
    }

    setError("");
    setBooking(true);

    const eventId = event._id || event.id;

    try {
      // Free ticket — skip payment gateway
      if (!selected.price || selected.price === 0) {
        const res = await bookTicket({ eventId, tier: selected.label, price: 0 });
        if (res.success) {
          setConfirmedTicket(res);
        } else {
          setError(res.message || "Failed to book ticket. Please try again.");
        }
        setBooking(false);
        return;
      }

      // Paid ticket — Razorpay flow
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        setError("Payment gateway failed to load. Please check your connection.");
        setBooking(false);
        return;
      }

      const orderRes = await createPaymentOrder({
        eventId,
        tier: selected.label,
        price: selected.price,
      });

      if (!orderRes.success) {
        setError(orderRes.message || "Could not initiate payment. Please try again.");
        setBooking(false);
        return;
      }

      const { order } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "QREventix",
        description: `${selected.label} – ${event.title}`,
        image: event.image || "",
        order_id: order.id,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#6366f1" },
        handler: async (paymentResponse) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              eventId,
              tier: selected.label,
              price: selected.price,
            });

            if (verifyRes.success) {
              setConfirmedTicket(verifyRes);
            } else {
              setError(verifyRes.message || "Payment verification failed.");
            }
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed.");
          } finally {
            setBooking(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBooking(false);
            setError("Payment was cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. Please try again.");
        setBooking(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
      setBooking(false);
    }
  };

  if (confirmedTicket) {
    return <QRTicketModal event={event} ticketDetails={confirmedTicket} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Choose Your Ticket</h2>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/40">
              <FiX />
            </button>
          </div>
          <p className="mt-1 text-sm text-indigo-200">{event.title}</p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {ticketTiers.map((tier) => (
            <button
              type="button"
              key={tier.label}
              disabled={!tier.available || booking}
              onClick={() => setSelected(tier)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                !tier.available
                  ? "opacity-50 cursor-not-allowed border-slate-200"
                  : selected?.label === tier.label
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-200 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{tier.label}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{tier.desc}</p>
                </div>
                <p className={`text-lg font-black ${tier.available ? "text-indigo-600" : "text-slate-400"}`}>
                  {tier.priceLabel}
                </p>
              </div>
            </button>
          ))}

          <Button
            variant="primary"
            className="w-full mt-2"
            disabled={!selected || booking}
            onClick={handleBook}
          >
            {booking
              ? "Booking..."
              : selected
              ? `Book ${selected.label} – ${selected.priceLabel}`
              : "Select a Ticket Tier"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main EventDetails Component ───────────────────────────────────────────────
export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavorited, toggle: toggleFavorite } = useFavorites();
  const [event, setEvent] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);
  const [favToggling, setFavToggling] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const registrationTrend = useMemo(() => {
    if (!event) return [];
    const total = event.registered || 0;
    const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"];
    return weeks.map((week, i) => ({
      week,
      registrations: Math.round(total * Math.pow((i + 1) / 6, 1.4)),
    }));
  }, [event]);

  const handleShareEvent = async () => {
    const url = window.location.href;
    const shareData = {
      title: event?.title || "Check out this event",
      text: `${event?.title} — ${event?.date} at ${event?.location}. Grab your tickets!`,
      url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${url}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (favToggling || !event) return;
    setFavToggling(true);
    try {
      await toggleFavorite(event._id || event.id);
    } catch {
      // context rolls back optimistic update
    } finally {
      setFavToggling(false);
    }
  };

  useEffect(() => {
    getEventById(id)
      .then((res) => {
        if (res.success && res.event) {
          setEvent(res.event);
        } else {
          setEvent(res);
        }
      })
      .catch((err) => console.error("Error fetching event details", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-xl font-bold">Event not found</p>
          <Button variant="primary" className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const fillPct = Math.round((event.registered / event.capacity) * 100);

  return (
    <>
      <PublicNavbar />
      {showBooking && <BookingModal event={event} onClose={() => setShowBooking(false)} />}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={event.gallery}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <main className="container-page py-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* ── Left column ── */}
          <div className="space-y-6">
            {/* Banner */}
            <div className="glass-card overflow-hidden">
              <div className="relative h-[280px] md:h-[420px]">
                <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                <span className="absolute left-4 top-4 rounded-xl bg-indigo-600/90 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
                  {event.type}
                </span>
              </div>
            </div>

            {/* Event Overview */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-black">Event Overview</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["Capacity", `${event.capacity?.toLocaleString()} seats`],
                  ["Registered", `${event.registered?.toLocaleString()}`],
                  ["Status", event.status],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-5 text-center">
                    <p className="text-xl font-black">{value}</p>
                    <p className="mt-1 text-sm text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-slate-600">
                {event.description || `${event.title} is a premier curated experience featuring world-class performers and speakers. Thousands of attendees enjoy seamless check-in via QR tickets.`}
              </p>
            </div>

            {/* Gallery */}
            {event.gallery?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-2xl font-black">Gallery</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {event.gallery.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="group relative overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 rounded-xl bg-black/0 transition-colors group-hover:bg-black/20" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Perks */}
            {event.amenities?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-2xl font-black">Event Perks</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {event.amenities.map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold">
                      <FiCheckCircle className="text-indigo-500 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registration trend */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-black">Registration Trend</h2>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={registrationTrend}>
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="glass-card p-6">
              <span className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-bold uppercase text-indigo-700">
                {event.tag || "Upcoming Event"}
              </span>
              <h1 className="mt-4 text-2xl font-black">{event.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-slate-500">
                <FiMapPin /> {event.location}
              </p>
              <p className="mt-2 flex items-center gap-2 text-slate-500">
                <FiCalendar /> {event.date} · {event.time}
              </p>

              <p className="mt-5 text-4xl font-black text-indigo-700">{event.priceLabel}</p>
              <p className="text-sm text-slate-400 mt-1">per person</p>

              {/* Seat fill */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500 flex items-center gap-1">
                    <FiUsers className="text-indigo-400" /> {event.registered?.toLocaleString()} registered
                  </span>
                  <span className="font-bold text-indigo-600">{fillPct}% full</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {Math.max(0, event.capacity - event.registered)?.toLocaleString()} spots remaining
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <Button variant="primary" className="w-full text-base" onClick={() => setShowBooking(true)}>
                  <FiTag className="mr-2 inline" /> Book Tickets Now
                </Button>
                <Button
                  variant="outline"
                  className={`w-full ${event && isFavorited(event._id || event.id) ? "border-red-400 text-red-500 hover:bg-red-50" : ""}`}
                  onClick={handleFavorite}
                  disabled={favToggling}
                >
                  <FiHeart className={`mr-2 inline ${event && isFavorited(event._id || event.id) ? "fill-current" : ""}`} />
                  {event && isFavorited(event._id || event.id) ? "Saved" : "Save Event"}
                </Button>
                <Button variant="outline" className="w-full" onClick={handleShareEvent}>
                  <FiShare2 className="mr-2 inline" /> {shareCopied ? "Copied!" : "Share Event"}
                </Button>
              </div>
            </div>

            {/* QR Info card */}
            <div className="glass-card p-5 border border-indigo-100 bg-indigo-50">
              <div className="flex gap-3">
                <MdQrCode2 className="text-3xl text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-indigo-900">Instant QR Ticket Delivery</p>
                  <p className="mt-1 text-sm text-indigo-700">
                    Your QR ticket is generated instantly after booking. Show it at the entrance
                    for seamless contactless check-in.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
