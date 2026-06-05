// src/components/property/PropertyCard.jsx

import { Link } from "react-router-dom";
import { FiHeart, FiMapPin } from "react-icons/fi";
import { MdCompareArrows } from "react-icons/md";
import { useApp } from "../../context/AppContext";
import Button from "../common/Button";

export default function PropertyCard({ property }) {
  const { wishlist, compareList, toggleWishlist, toggleCompare } = useApp();

  const wished = wishlist.some((item) => item.id === property.id);
  const compared = compareList.some((item) => item.id === property.id);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-card">
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="h-full w-full object-cover"
        />

        <span className="absolute left-4 top-4 rounded-lg bg-gold-600 px-3 py-1 text-xs font-bold uppercase text-white">
          {property.tag}
        </span>

        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => toggleWishlist(property)}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ${
              wished ? "text-red-500" : "text-slate-700"
            }`}
          >
            <FiHeart />
          </button>

          <button
            onClick={() => toggleCompare(property)}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ${
              compared ? "text-primary-600" : "text-slate-700"
            }`}
          >
            <MdCompareArrows />
          </button>
        </div>
      </div>

      <div className="p-5">
        <span className="rounded-md bg-gold-50 px-2 py-1 text-xs font-semibold text-gold-700">
          {property.type}
        </span>

        <h3 className="mt-3 text-lg font-bold text-ink-900">{property.title}</h3>

        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <FiMapPin />
          {property.location}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {property.beds > 0 && (
            <span className="rounded-lg bg-slate-100 px-3 py-1">
              {property.beds} Beds
            </span>
          )}
          <span className="rounded-lg bg-slate-100 px-3 py-1">
            {property.baths} Baths
          </span>
          <span className="rounded-lg bg-slate-100 px-3 py-1">
            {property.area} sq.ft
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-gold-700">{property.priceLabel}</p>
            <p className="text-sm text-slate-500">{property.pricePerSqft}</p>
          </div>

          <Link to={`/properties/${property.id}`}>
            <Button variant="gold" className="px-4 py-2">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
