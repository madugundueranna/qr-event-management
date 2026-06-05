import { useEffect, useState } from "react";
import { FiDownload, FiExternalLink } from "react-icons/fi";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { getPressItems } from "../../api/contentApi";

const ASSETS = [
  { label: "Company Logo (SVG)",         type: "svg" },
  { label: "Company Logo (PNG – White)", type: "png" },
  { label: "Company Logo (PNG – Dark)",  type: "png" },
  { label: "Product Screenshots Pack",   type: "zip" },
  { label: "Founder Headshots",          type: "zip" },
  { label: "Brand Guidelines PDF",       type: "pdf" },
];

function Spinner() {
  return (
    <div className="flex min-h-[30vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

export default function Press() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPressItems()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-indigo-900 py-20 text-white">
        <div className="container-page text-center">
          <h1 className="text-5xl font-black">Press & Media</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
            Latest coverage, press resources, and media enquiries for QREventix.
          </p>
          <a
            href="mailto:press@qreventix.in"
            className="mt-8 inline-block rounded-xl bg-indigo-500 px-8 py-3 font-bold hover:bg-indigo-400 transition"
          >
            Media Enquiries → press@qreventix.in
          </a>
        </div>
      </section>

      {/* Press Coverage */}
      <section className="container-page py-20">
        <h2 className="mb-10 text-3xl font-black text-slate-900">In the News</h2>

        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-slate-400">No press coverage yet.</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {items.map(({ _id, publication, headline, summary, date, logo, logoColor, link }) => (
              <div
                key={_id}
                className="flex items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft hover:-translate-y-0.5 transition"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-black ${logoColor}`}>
                  {logo}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{publication} · {date}</p>
                  <p className="mt-2 font-semibold text-slate-800 leading-snug">{headline}</p>
                  {summary && <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{summary}</p>}
                </div>
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="mt-1 shrink-0">
                    <FiExternalLink className="text-slate-400 hover:text-indigo-600 transition" />
                  </a>
                ) : (
                  <FiExternalLink className="mt-1 shrink-0 text-slate-300" />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Press Kit */}
      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <h2 className="mb-3 text-3xl font-black text-slate-900">Press Kit</h2>
          <p className="mb-10 text-slate-500">
            Download official brand assets, logos, and product screenshots for use in editorial coverage.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ASSETS.map(({ label, type }) => (
              <button
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-soft hover:border-indigo-300 hover:text-indigo-600 transition"
              >
                <span>{label}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs uppercase text-slate-400">{type}</span>
                  <FiDownload />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container-page py-20 text-center">
        <h2 className="text-3xl font-black text-slate-900">Get in Touch</h2>
        <p className="mt-4 text-slate-500 max-w-md mx-auto">
          For press enquiries, interview requests, or partnership proposals, contact our media team directly.
        </p>
        <div className="mt-8 inline-flex flex-col sm:flex-row gap-4">
          <a href="mailto:press@qreventix.in" className="btn-primary px-8 py-3">
            Email the Press Team
          </a>
          <a href="tel:+918041205000" className="btn-outline px-8 py-3">
            +91 80 4120 5000
          </a>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
