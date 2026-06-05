// src/pages/attendee/MyFavorites.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiCalendar, FiMapPin, FiArrowRight, FiSearch } from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { getUserFavorites } from "../../api/favoriteApi";

function FavoriteEventCard({ event, onUnfavorite }) {
  const { isFavorited, toggle } = useFavorites();
  const [toggling, setToggling] = useState(false);
  const favorited = isFavorited(event._id || event.id);

  const handleUnfavorite = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      await toggle(event._id || event.id);
      if (onUnfavorite) onUnfavorite(event._id || event.id);
    } catch {
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold uppercase text-white shadow">
          {event.tag || event.type}
        </span>
        <button
          onClick={handleUnfavorite}
          disabled={toggling}
          title="Remove from favorites"
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition disabled:opacity-60 ${
            favorited ? "text-red-500 hover:text-red-400" : "text-slate-400"
          }`}
        >
          <FiHeart className={favorited ? "fill-current" : ""} />
        </button>
      </div>

      <div className="p-5">
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
          {event.type}
        </span>
        <h3 className="mt-3 text-base font-bold leading-snug text-slate-800">
          {event.title}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <FiMapPin className="shrink-0 text-indigo-400" /> {event.location}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <FiCalendar className="shrink-0 text-indigo-400" /> {event.date} · {event.time}
        </p>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xl font-black text-indigo-700">{event.priceLabel}</p>
          <Link
            to={`/events/${event._id || event.id}`}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-indigo-500"
          >
            <MdQrCode2 className="text-base" /> Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MyFavorites() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUserFavorites()
      .then((data) => {
        if (data?.favorites) setEvents(data.favorites);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnfavorite = (id) => {
    setEvents((prev) => prev.filter((e) => String(e._id || e.id) !== String(id)));
  };

  const filtered = events.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PublicNavbar />
      <main className="container-page py-8 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900">
              <FiHeart className="text-red-500 fill-current" />
              My Favorites
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {events.length > 0
                ? `${events.length} saved event${events.length !== 1 ? "s" : ""}`
                : "Events you save will appear here"}
            </p>
          </div>
          <Link
            to="/events"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow transition hover:bg-indigo-500"
          >
            Browse Events <FiArrowRight />
          </Link>
        </div>

        {/* Search */}
        {events.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <FiSearch className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search your favorites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <FiHeart className="text-3xl text-red-300" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">No favorites yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Tap the heart icon on any event to save it here.
              </p>
            </div>
            <Link
              to="/events"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500"
            >
              Explore Events <FiArrowRight />
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="font-semibold text-slate-600">No results for "{search}"</p>
            <button onClick={() => setSearch("")} className="text-sm text-indigo-600 hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((event) => (
              <FavoriteEventCard
                key={event._id || event.id}
                event={event}
                onUnfavorite={handleUnfavorite}
              />
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
