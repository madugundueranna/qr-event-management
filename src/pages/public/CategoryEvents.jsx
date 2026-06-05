// src/pages/public/CategoryEvents.jsx — filtered event listing by category type(s)

import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCalendar, FiArrowLeft } from "react-icons/fi";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import EventCard from "../../components/event/EventCard";
import { getEvents } from "../../api/eventApi";

// Maps URL slug → { title, subtitle, types[] }
const CATEGORY_CONFIG = {
  music: {
    title: "Music Events",
    subtitle: "Concerts, live performances, and music festivals across India.",
    types: ["Music"],
    gradient: "from-purple-600 to-indigo-700",
  },
  "tech-conferences": {
    title: "Tech & Conferences",
    subtitle: "Technology summits, developer conferences, and industry meetups.",
    types: ["Technology", "Conference"],
    gradient: "from-indigo-600 to-blue-700",
  },
  sports: {
    title: "Sports Events",
    subtitle: "Live sporting action — matches, marathons, and tournaments.",
    types: ["Sports"],
    gradient: "from-green-600 to-emerald-700",
  },
  "arts-culture": {
    title: "Arts & Culture",
    subtitle: "Theatre, exhibitions, cultural festivals, and creative showcases.",
    types: ["Arts & Culture", "Arts", "Theatre"],
    gradient: "from-rose-600 to-pink-700",
  },
};

export default function CategoryEvents() {
  const { category } = useParams();
  const config = CATEGORY_CONFIG[category];

  const [allFetched, setAllFetched] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    if (!config) return;

    setLoading(true);
    setError("");

    // Fetch for each type and merge — remove duplicates by _id
    Promise.all(config.types.map((t) => getEvents({ type: t })))
      .then((results) => {
        const seen = new Set();
        const merged = [];
        results.forEach(({ data }) => {
          (data || []).forEach((ev) => {
            const id = ev.id || ev._id;
            if (!seen.has(id)) { seen.add(id); merged.push(ev); }
          });
        });
        setAllFetched(merged);
      })
      .catch(() => setError("Failed to load events. Please try again."))
      .finally(() => setLoading(false));
  }, [category]);

  if (!config) {
    return (
      <>
        <PublicNavbar />
        <main className="container-page py-24 text-center">
          <h1 className="text-3xl font-black text-slate-800">Category not found</h1>
          <Link to="/events" className="mt-6 inline-flex items-center gap-2 text-indigo-600 hover:underline">
            <FiArrowLeft /> Browse all events
          </Link>
        </main>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <PublicNavbar />

      {/* Hero banner */}
      <section className={`bg-gradient-to-r ${config.gradient} py-16 text-white`}>
        <div className="container-page">
          <Link
            to="/events"
            className="mb-6 inline-flex items-center gap-2 text-white/70 text-sm hover:text-white transition"
          >
            <FiArrowLeft /> All Events
          </Link>
          <h1 className="text-4xl font-black">{config.title}</h1>
          <p className="mt-3 max-w-xl text-white/80 text-lg">{config.subtitle}</p>
        </div>
      </section>

      <main className="container-page py-10">
        {error && <p className="py-10 text-center text-red-500">{error}</p>}

        {loading && !error && (
          <div className="flex justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500" />
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="mb-6 text-slate-500">
              {allFetched.length > 0
                ? `${allFetched.length} event${allFetched.length !== 1 ? "s" : ""} found`
                : ""}
            </p>

            {allFetched.length === 0 ? (
              <div className="py-24 text-center text-slate-400">
                <FiCalendar className="mx-auto text-5xl mb-4" />
                <p className="text-xl font-bold">No events yet</p>
                <p className="mt-2 text-sm">Check back soon — new events are added regularly.</p>
                <Link
                  to="/events"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition"
                >
                  Browse all events
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {allFetched.map((ev) => (
                  <EventCard key={ev.id || ev._id} property={ev} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <PublicFooter />
    </>
  );
}
