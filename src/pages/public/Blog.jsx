import { useEffect, useState } from "react";
import { FiCalendar, FiUser, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { getBlogPosts } from "../../api/contentApi";

const CATEGORY_COLORS = {
  Technology:       "bg-blue-50 text-blue-700",
  Events:           "bg-purple-50 text-purple-700",
  "Organiser Tips": "bg-amber-50 text-amber-700",
  Industry:         "bg-green-50 text-green-700",
  Research:         "bg-rose-50 text-rose-700",
  Product:          "bg-indigo-50 text-indigo-700",
};

function Spinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-400 border-t-transparent" />
    </div>
  );
}

export default function Blog() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlogPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...rest] = posts;

  return (
    <>
      <PublicNavbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-20 text-white">
        <div className="container-page text-center">
          <h1 className="text-5xl font-black">QREventix Blog</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
            Stories, guides, and insights from the world of live events.
          </p>
        </div>
      </section>

      <main className="container-page py-16">
        {loading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-xl font-bold">No posts yet</p>
            <p className="mt-2 text-sm">Check back soon for stories and guides.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            <Link
              to={`/blog/${featured.slug}`}
              className="mb-14 block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 lg:grid lg:grid-cols-2"
            >
              <img
                src={featured.coverImage?.url || featured.image}
                alt={featured.title}
                className="h-64 w-full object-cover lg:h-full"
              />
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <span className={`mb-3 inline-block w-fit rounded-lg px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[featured.category] || "bg-slate-100 text-slate-700"}`}>
                  {featured.category}
                </span>
                <h2 className="text-2xl font-black text-slate-900 leading-snug">{featured.title}</h2>
                <p className="mt-4 text-slate-500 leading-relaxed">{featured.excerpt}</p>
                <div className="mt-6 flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5"><FiUser /> {featured.author}</span>
                  <span className="flex items-center gap-1.5"><FiCalendar /> {featured.date}</span>
                  <span>{featured.readTime}</span>
                </div>
                <div className="btn-primary mt-6 flex w-fit items-center gap-2">
                  Read Article <FiArrowRight />
                </div>
              </div>
            </Link>

            {/* Post grid */}
            {rest.length > 0 && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <Link
                    key={post._id || post.slug}
                    to={`/blog/${post.slug}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-card"
                  >
                    <img src={post.coverImage?.url || post.image} alt={post.title} className="h-48 w-full object-cover" />
                    <div className="p-6">
                      <span className={`mb-2 inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ${CATEGORY_COLORS[post.category] || "bg-slate-100 text-slate-700"}`}>
                        {post.category}
                      </span>
                      <h3 className="mt-2 font-bold text-slate-900 leading-snug">{post.title}</h3>
                      <p className="mt-3 text-sm text-slate-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                      <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><FiUser /> {post.author}</span>
                        <span className="flex items-center gap-1"><FiCalendar /> {post.date}</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
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
