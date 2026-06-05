// src/pages/public/Home.jsx  →  QREventix Home (Events)

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiMapPin,
  FiSearch,
  FiShield,
  FiStar,
} from "react-icons/fi";

import { MdQrCode2, MdOutlineQrCodeScanner } from "react-icons/md";
import {
  MicOutlined,
  BusinessCenterOutlined,
  BuildOutlined,
  EmojiEventsOutlined,
  PaletteOutlined,
  LaptopOutlined,
  EmojiEmotionsOutlined,
  RestaurantOutlined,
} from "@mui/icons-material";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import EventCard from "../../components/event/EventCard";
import { getEvents, getStats } from "../../api/eventApi";

const CATEGORY_DEFS = [
  { label: "Concerts",    Icon: MicOutlined,            type: "Music"       },
  { label: "Conferences", Icon: BusinessCenterOutlined, type: "Conference"  },
  { label: "Workshops",   Icon: BuildOutlined,          type: "Workshop"    },
  { label: "Sports",      Icon: EmojiEventsOutlined,    type: "Sports"      },
  { label: "Arts",        Icon: PaletteOutlined,        type: "Arts"        },
  { label: "Tech",        Icon: LaptopOutlined,         type: "Tech"        },
  { label: "Comedy",      Icon: EmojiEmotionsOutlined,  type: "Comedy"      },
  { label: "Food & Drink",Icon: RestaurantOutlined,     type: "Food & Drink"},
];

const CATEGORIES_INITIAL = 4;

const STAT_DEFS = [
  { key: "totalEvents",     label: "Events Hosted",  format: (n) => `${n.toLocaleString()}+` },
  { key: "totalRegistered", label: "Attendees",      format: (n) => `${n.toLocaleString()}+` },
  { key: "totalRevenue",    label: "Ticket Sales",   format: (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L+` : `₹${n.toLocaleString()}+` },
  { key: "totalCities",     label: "Cities Covered", format: (n) => `${n}+` },
];

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("../../api/eventApi").then(({ getStats: _ }) => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white/40" /></div>;
  }

  if (reviews.length === 0) {
    return (
      <p className="py-8 text-center text-white/50">
        No reviews yet. Be the first to attend an event and share your experience!
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {reviews.map(({ name, location, text, rating }) => (
        <div key={name} className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur">
          <div className="flex gap-1 text-yellow-400">
            {Array.from({ length: rating }).map((_, i) => <FiStar key={i} className="fill-current" />)}
          </div>
          <p className="mt-4 text-white/80">&ldquo;{text}&rdquo;</p>
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="font-bold">{name}</p>
            <p className="text-sm text-white/50">{location}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [platformStats, setPlatformStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [query, setQuery] = useState("");

  useEffect(() => {
    setEventsLoading(true);
    getEvents()
      .then((res) => setEvents(res.data.slice(0, 3)))
      .catch(() => setEventsError("Failed to load events."))
      .finally(() => setEventsLoading(false));

    setStatsLoading(true);
    getStats()
      .then((res) => setPlatformStats(res.stats || res))
      .catch(() => setStatsError("Failed to load stats."))
      .finally(() => setStatsLoading(false));
  }, []);

  const categories = useMemo(() =>
    CATEGORY_DEFS.map(({ label, Icon, type }) => ({
      label,
      Icon,
      count: platformStats?.typeCounts?.[type] ?? 0,
    })),
    [platformStats]
  );

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#07122d,#1a2454,#25345c)] text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)",
          }}
        />

        <div className="container-page relative py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-600/10 px-5 py-2 text-sm font-semibold text-indigo-300">
              <MdQrCode2 /> QR-Powered Contactless Check-In
            </span>

            <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
              Discover & Book{" "}
              <span className="text-indigo-400">Amazing Events</span>{" "}
              Near You
            </h1>

            <p className="mt-6 text-xl text-white/70">
              Instant QR tickets • Contactless entry • 15,000+ events across India
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-slate-400" />
                <input
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-5 py-4 pl-14 text-white placeholder:text-white/50 backdrop-blur focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  placeholder="Search events by name, city or category..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Link
                to={`/events${query ? `?q=${query}` : ""}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-indigo-500"
              >
                Search <FiArrowRight />
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm text-white/60">
              {["Whitefield, Bangalore", "Madhapur, Hyderabad", "Bandra, Mumbai"].map((loc) => (
                <Link
                  key={loc}
                  to={`/events?q=${loc}`}
                  className="flex items-center gap-1 hover:text-indigo-300"
                >
                  <FiMapPin className="text-xs" /> {loc}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-white py-10">
        <div className="container-page grid grid-cols-2 gap-6 lg:grid-cols-4">
          {statsError ? (
            <p className="col-span-4 text-center text-sm text-red-500">{statsError}</p>
          ) : STAT_DEFS.map(({ key, label, format }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-black text-indigo-600">
                {statsLoading ? "—" : format(platformStats?.[key] ?? 0)}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black">Browse by Category</h2>
          <p className="mt-3 text-slate-500">
            Explore curated events that match your interests.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(showAllCategories ? categories : categories.slice(0, CATEGORIES_INITIAL)).map(({ label, Icon, count }) => (
            <Link
              key={label}
              to={`/events?category=${encodeURIComponent(label)}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-card"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 group-hover:bg-indigo-100">
                <Icon sx={{ fontSize: 32, color: "#6366f1" }} />
              </div>
              <p className="mt-4 font-bold text-ink-900">{label}</p>
              <p className="mt-1 text-sm text-slate-500">{count} events</p>
            </Link>
          ))}
        </div>

        {categories.length > CATEGORIES_INITIAL && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAllCategories((prev) => !prev)}
              className="flex items-center gap-2 rounded-2xl border border-indigo-200 bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-soft transition hover:bg-indigo-50 hover:border-indigo-400"
            >
              {showAllCategories ? "Show Less" : `Show More (${categories.length - CATEGORIES_INITIAL} more)`}
              <FiArrowRight className={`transition-transform ${showAllCategories ? "rotate-90" : ""}`} />
            </button>
          </div>
        )}
      </section>

      {/* Featured Events */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-4xl font-black">Featured Events</h2>
              <p className="mt-2 text-slate-500">
                Hand-picked upcoming events, verified and ready to book.
              </p>
            </div>
            <Link
              to="/events"
              className="btn-outline flex items-center gap-2"
            >
              View All <FiArrowRight />
            </Link>
          </div>

          {eventsError ? (
            <p className="py-10 text-center text-slate-500">{eventsError}</p>
          ) : eventsLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500" />
            </div>
          ) : events.length === 0 ? (
            <p className="py-10 text-center text-slate-500">No events available right now. Check back soon!</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} property={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Us */}
      <section className="container-page py-16">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black">Why Choose QREventix?</h2>
          <p className="mt-3 text-slate-500">
            Built for seamless event discovery and contactless experiences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: <MdQrCode2 className="text-4xl text-indigo-600" />,
              title: "Instant QR Tickets",
              desc: "Get your unique QR ticket immediately after booking. No printing needed — just show your phone at the door.",
            },
            {
              icon: <MdOutlineQrCodeScanner className="text-4xl text-violet-600" />,
              title: "Contactless Check-In",
              desc: "Our QR scanner system ensures zero queues. Scan, verify, and enter in under 3 seconds.",
            },
            {
              icon: <FiShield className="text-4xl text-green-600" />,
              title: "100% Verified Events",
              desc: "Every event is verified for authenticity. Secure payments, genuine listings, and instant refunds.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="glass-card p-8 text-center transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50">
                {icon}
              </div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[linear-gradient(135deg,#07122d,#25345c)] py-16 text-white">
        <div className="container-page">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-black">What Attendees Say</h2>
            <p className="mt-3 text-white/60">Real stories from real event-goers.</p>
          </div>

          <ReviewsSection />
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 text-center">
        <h2 className="text-4xl font-black">
          Ready to Discover Your Next Event?
        </h2>
        <p className="mt-4 text-lg text-slate-500">
          Join {statsLoading ? "thousands of" : `${(platformStats?.totalRegistered ?? 0).toLocaleString()}+`} attendees who experience events with instant QR tickets.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/events"
            className="btn-indigo flex items-center gap-2 px-8 py-4 text-base"
          >
            Explore Events <FiArrowRight />
          </Link>
          <Link to="/register" className="btn-outline px-8 py-4 text-base">
            Create Free Account
          </Link>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
