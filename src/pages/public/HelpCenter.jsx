import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { getHelpFAQs } from "../../api/contentApi";

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-semibold text-slate-800">{q}</span>
        {open ? <FiChevronUp className="shrink-0 text-indigo-500" /> : <FiChevronDown className="shrink-0 text-slate-400" />}
      </button>
      {open && (
        <p className="pb-5 text-sm text-slate-500 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex min-h-[30vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

export default function HelpCenter() {
  const [faqs, setFaqs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    getHelpFAQs()
      .then(setFaqs)
      .finally(() => setLoading(false));
  }, []);

  const visible = faqs.map((section) => ({
    ...section,
    items: section.items.filter(
      ({ q, a }) =>
        !search.trim() ||
        q.toLowerCase().includes(search.toLowerCase()) ||
        a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-700 py-20 text-white">
        <div className="container-page text-center">
          <h1 className="text-5xl font-black">Help Center</h1>
          <p className="mt-4 text-white/80 text-lg">Find answers to the most common questions.</p>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-xl relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-2xl bg-white py-3.5 pl-11 pr-5 text-slate-800 placeholder-slate-400 shadow-lg outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <main className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <Spinner />
          ) : visible.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-xl font-bold">{search ? "No results found" : "No FAQs available"}</p>
              {search && (
                <>
                  <p className="mt-2 text-sm">Try different keywords or browse all categories below.</p>
                  <button onClick={() => setSearch("")} className="mt-4 text-indigo-600 hover:underline text-sm">
                    Clear search
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {visible.map(({ category, items }) => (
                <div key={category} className="glass-card p-6">
                  <h2 className="mb-4 text-lg font-black text-slate-900">{category}</h2>
                  {items.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
                </div>
              ))}
            </div>
          )}

          {/* Still need help? */}
          <div className="mt-14 rounded-2xl bg-indigo-50 border border-indigo-100 p-8 text-center">
            <h3 className="text-xl font-black text-slate-900">Still need help?</h3>
            <p className="mt-3 text-slate-500">
              Can't find what you're looking for? Our support team is here for you.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact" className="btn-primary px-6 py-2.5">Contact Us</Link>
              <Link to="/report-issue" className="btn-outline px-6 py-2.5">Report an Issue</Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
