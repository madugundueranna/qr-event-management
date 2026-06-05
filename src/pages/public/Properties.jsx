// src/pages/public/Properties.jsx  →  Events listing page

import { useEffect, useMemo, useRef, useState } from "react";
import { FiGrid, FiList, FiSearch, FiCalendar } from "react-icons/fi";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import EventCard from "../../components/event/EventCard";
import { getEvents } from "../../api/eventApi";
import { getCities, getEventCategories } from "../../api/categoryApi";
import Button from "../../components/common/Button";

// Sentinel value meaning "no filter applied"
const ALL_ID = "";

export default function Events() {
  // ── filter state (IDs, not name strings) ───────────────────────────────
  const [selectedCityId, setSelectedCityId]         = useState(ALL_ID);
  const [selectedCategoryId, setSelectedCategoryId] = useState(ALL_ID);
  const [query, setQuery]                           = useState("");
  const [view, setView]                             = useState("grid");

  // ── data from API ───────────────────────────────────────────────────────
  const [events, setEvents]                 = useState([]);
  const [allEvents, setAllEvents]           = useState([]);
  const [cityOptions, setCityOptions]       = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");

  // ── fetch dropdown options once on mount ───────────────────────────────
  useEffect(() => {
    getCities()
      .then((res) => setCityOptions(res.cities || []))
      .catch(() => {});
    getEventCategories()
      .then((res) => setCategoryOptions(res.categories || []))
      .catch(() => {});
  }, []);

  // ── fetch all events (no category filter) for per-category pill counts ─
  useEffect(() => {
    const params = {};
    if (selectedCityId) params.city_id = selectedCityId;
    getEvents(params)
      .then((res) => setAllEvents(res.data || []))
      .catch(() => {});
  }, [selectedCityId]);

  // ── fetch events from server whenever city or category filter changes ──
  // City and category filtering is server-side (by FK _id).
  // Text search stays client-side so typing feels instant.
  useEffect(() => {
    setLoading(true);
    setError("");

    const params = {};
    if (selectedCityId)     params.city_id     = selectedCityId;
    if (selectedCategoryId) params.category_id = selectedCategoryId;

    getEvents(params)
      .then((res) => setEvents(res.data || []))
      .catch(() => setError("Failed to load events. Please try again."))
      .finally(() => setLoading(false));
  }, [selectedCityId, selectedCategoryId]);

  // ── per-category event counts from the full (unfiltered) event set ──────
  const categoryCounts = useMemo(() => {
    const counts = {};
    allEvents.forEach((ev) => {
      if (ev.type) counts[ev.type] = (counts[ev.type] || 0) + 1;
    });
    return counts;
  }, [allEvents]);

  // ── client-side text search over the server-filtered result set ────────
  const filtered = useMemo(() => {
    if (!query.trim()) return events;
    const q = query.toLowerCase();
    return events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(q) ||
        (ev.location || "").toLowerCase().includes(q) ||
        (ev.city || "").toLowerCase().includes(q)
    );
  }, [events, query]);

  // ── helpers ─────────────────────────────────────────────────────────────
  const handleCityChange = (e) => setSelectedCityId(e.target.value);

  const handleCategoryChange = (e) => setSelectedCategoryId(e.target.value);

  const handleCategoryPill = (id) =>
    setSelectedCategoryId((prev) => (prev === id ? ALL_ID : id));

  return (
    <>
      <PublicNavbar />

      <main className="container-page py-8">
        {/* ── Filter bar ─────────────────────────────────────────────── */}
        <section className="glass-card p-4 mb-6">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_repeat(2,1fr)_auto]">
            {/* Text search */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="form-input pl-11"
                placeholder="Search by event name or city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* City dropdown — values are _id strings from the DB */}
            <select
              className="form-select"
              value={selectedCityId}
              onChange={handleCityChange}
            >
              <option value={ALL_ID}>All Cities</option>
              {cityOptions.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Category dropdown — values are _id strings from the DB */}
            <select
              className="form-select"
              value={selectedCategoryId}
              onChange={handleCategoryChange}
            >
              <option value={ALL_ID}>All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <Button
              variant="primary"
              onClick={() => {
                setSelectedCityId(ALL_ID);
                setSelectedCategoryId(ALL_ID);
                setQuery("");
              }}
            >
              Reset
            </Button>
          </div>
        </section>

        {/* ── Category pills ─────────────────────────────────────────── */}
        <section className="mt-2 mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {/* "All" pill */}
          <button
            key="all"
            onClick={() => handleCategoryPill(ALL_ID)}
            className={`rounded-2xl border p-4 text-left transition ${
              selectedCategoryId === ALL_ID
                ? "border-indigo-600 bg-indigo-600 text-white shadow-card"
                : "border-slate-200 bg-white hover:border-indigo-300"
            }`}
          >
            <p className="font-bold text-sm">All Events</p>
            <p className="mt-1 text-xs opacity-70">{allEvents.length} events</p>
          </button>

          {categoryOptions.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryPill(cat._id)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedCategoryId === cat._id
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-card"
                  : "border-slate-200 bg-white hover:border-indigo-300"
              }`}
            >
              <p className="font-bold text-sm">{cat.name}</p>
              <p className="mt-1 text-xs opacity-70">
                {selectedCategoryId === cat._id
                  ? `${filtered.length} shown`
                  : `${categoryCounts[cat.name] ?? 0} total`}
              </p>
            </button>
          ))}
        </section>

        {/* ── Results ────────────────────────────────────────────────── */}
        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-black">
                {loading ? "Loading…" : `${filtered.length} Events Found`}
              </h1>
              <p className="mt-1 text-slate-500">Showing upcoming events near you</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === "grid" ? "primary" : "outline"}
                onClick={() => setView("grid")}
              >
                <FiGrid />
              </Button>
              <Button
                variant={view === "list" ? "primary" : "outline"}
                onClick={() => setView("list")}
              >
                <FiList />
              </Button>
            </div>
          </div>

          {error && (
            <p className="py-10 text-center text-red-500">{error}</p>
          )}

          {loading && !error && (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500" />
            </div>
          )}

          {!loading && !error && (
            <div
              className={
                view === "grid"
                  ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-4"
              }
            >
              {filtered.map((ev) => (
                <EventCard key={ev.id || ev._id} property={ev} />
              ))}

              {filtered.length === 0 && (
                <div className="col-span-3 text-center py-20 text-slate-400">
                  <FiCalendar className="mx-auto text-5xl mb-4" />
                  <p className="text-xl font-bold">No events found</p>
                  <p className="text-sm mt-2">Try adjusting your filters</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
