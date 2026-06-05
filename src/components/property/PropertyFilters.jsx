// src/components/property/PropertyFilters.jsx

import { FiSearch } from "react-icons/fi";
import Button from "../common/Button";

const cities = ["All Cities", "Bangalore", "Hyderabad", "Mumbai", "Chennai", "Pune"];
const types = ["All", "Apartment", "Villa", "Independent Home", "Open Plot", "Commercial"];
const bhkOptions = ["All BHK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "4+ BHK"];
const priceRanges = [
  "₹1 Cr – ₹1.99 Cr",
  "₹1 Cr – ₹1.20 Cr",
  "₹1.20 Cr – ₹1.50 Cr",
  "₹1.50 Cr – ₹1.75 Cr",
  "₹1.75 Cr – ₹1.99 Cr",
];

export default function PropertyFilters({
  query,
  setQuery,
  type,
  setType,
  onSearch,
}) {
  return (
    <section className="glass-card p-4">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(4,1fr)_auto]">
        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="form-input pl-11"
            placeholder="Search by name, location or builder..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* City */}
        <select className="form-select">
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Type */}
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        {/* Price */}
        <select className="form-select">
          {priceRanges.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        {/* BHK */}
        <select className="form-select">
          {bhkOptions.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>

        <Button variant="gold" onClick={onSearch}>
          Search
        </Button>
      </div>
    </section>
  );
}
