// src/components/event/EventCard.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiCalendar, FiMapPin } from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";

export default function EventCard({ property }) {
  const { isAuthenticated } = useAuth();
  const { isFavorited, toggle } = useFavorites();
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);

  const favorited = isFavorited(property.id);

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (toggling) return;
    setToggling(true);
    try {
      await toggle(property.id);
    } catch {
      // context already rolled back optimistic update
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-card">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover transition hover:scale-105"
        />
        {/* Tag badge */}
        <span className="absolute left-4 top-4 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold uppercase text-white shadow">
          {property.tag || property.type}
        </span>
        {/* Favorite heart */}
        <button
          onClick={handleFavorite}
          disabled={toggling}
          title={isAuthenticated ? (favorited ? "Remove from favorites" : "Add to favorites") : "Login to save favorites"}
          className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition ${
            favorited ? "text-red-500" : "text-slate-500 hover:text-red-400"
          } disabled:opacity-60`}
        >
          <FiHeart className={favorited ? "fill-current" : ""} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
          {property.type}
        </span>
        <h3 className="mt-3 text-base font-bold text-ink-900 leading-snug">
          {property.title}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <FiMapPin className="shrink-0 text-indigo-400" /> {property.location}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <FiCalendar className="shrink-0 text-indigo-400" /> {property.date} · {property.time}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-black text-indigo-700">{property.priceLabel}</p>
            <p className="text-xs text-slate-400">per person</p>
          </div>
          <Link
            to={`/events/${property.id}`}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-indigo-500"
          >
            <MdQrCode2 className="text-base" /> Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
