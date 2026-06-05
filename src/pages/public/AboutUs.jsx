import { useEffect, useState } from "react";
import { FiTarget, FiEye, FiUsers, FiAward } from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { getAboutContent } from "../../api/contentApi";

const ICON_MAP = { FiTarget, FiEye, FiUsers, FiAward };

function Spinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

export default function AboutUs() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAboutContent()
      .then(setAbout)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-700 to-violet-700 py-20 text-white">
        <div className="container-page text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <MdQrCode2 className="text-3xl" />
          </div>
          <h1 className="text-5xl font-black">About QREventix</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80 leading-relaxed">
            {about?.heroTagline || "We're a Bangalore-born startup on a mission to transform how India discovers, books, and experiences live events — one QR code at a time."}
          </p>
        </div>
      </section>

      {loading ? <Spinner /> : (
        <>
          {/* Story */}
          <section className="container-page py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-black text-slate-900">Our Story</h2>
              {about?.storyParagraphs?.length ? (
                about.storyParagraphs.map((para, i) => (
                  <p key={i} className={`mt-${i === 0 ? 6 : 4} text-slate-600 leading-relaxed ${i === 0 ? "text-lg" : ""}`}>
                    {para}
                  </p>
                ))
              ) : (
                <p className="mt-6 text-slate-500">Story coming soon.</p>
              )}
            </div>
          </section>

          {/* Values */}
          {about?.values?.length > 0 && (
            <section className="bg-slate-50 py-20">
              <div className="container-page">
                <h2 className="mb-12 text-center text-3xl font-black text-slate-900">What Drives Us</h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {about.values.map(({ icon, title, body }) => {
                    const Icon = ICON_MAP[icon] || FiTarget;
                    return (
                      <div key={title} className="glass-card p-6 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                          <Icon className="text-xl text-indigo-600" />
                        </div>
                        <h3 className="font-bold text-slate-900">{title}</h3>
                        <p className="mt-3 text-sm text-slate-500 leading-relaxed">{body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Team */}
          {about?.team?.length > 0 && (
            <section className="container-page py-20">
              <h2 className="mb-12 text-center text-3xl font-black text-slate-900">Meet the Team</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {about.team.map(({ name, role, city, bio }) => (
                  <div key={name} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl font-black text-white">
                      {name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{name}</p>
                      <p className="text-sm text-indigo-600">{role}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{city}</p>
                      {bio && <p className="mt-2 text-xs text-slate-500 leading-relaxed">{bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stats strip */}
          {about?.stats?.length > 0 && (
            <section className="bg-indigo-700 py-16 text-white">
              <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
                {about.stats.map(({ number, label }) => (
                  <div key={label}>
                    <p className="text-4xl font-black">{number}</p>
                    <p className="mt-2 text-white/70 text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <PublicFooter />
    </>
  );
}
