import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiCalendar, FiUser, FiClock, FiArrowLeft } from "react-icons/fi";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { getBlogPostBySlug } from "../../api/contentApi";

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
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getBlogPostBySlug(slug)
      .then((data) => {
        if (!data) { setNotFound(true); return; }
        setPost(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <PublicNavbar />

      {loading ? (
        <Spinner />
      ) : notFound ? (
        <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="text-6xl font-black text-slate-200">404</p>
          <p className="mt-4 text-xl font-bold text-slate-700">Post not found</p>
          <p className="mt-2 text-slate-500">This article may have been moved or removed.</p>
          <Link to="/blog" className="btn-primary mt-6 px-6 py-2.5">
            Back to Blog
          </Link>
        </div>
      ) : (
        <article className="container-page py-16">
          <div className="mx-auto max-w-3xl">
            {/* Back link */}
            <button
              onClick={() => navigate(-1)}
              className="mb-8 flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-600 transition"
            >
              <FiArrowLeft /> Back to Blog
            </button>

            {/* Category badge */}
            <span className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[post.category] || "bg-slate-100 text-slate-700"}`}>
              {post.category}
            </span>

            {/* Title */}
            <h1 className="mt-4 text-4xl font-black text-slate-900 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><FiUser /> {post.author}</span>
              <span className="flex items-center gap-1.5"><FiCalendar /> {post.date}</span>
              <span className="flex items-center gap-1.5"><FiClock /> {post.readTime}</span>
            </div>

            {/* Cover image */}
            {post.coverImage?.url && (
              <img
                src={post.coverImage.url}
                alt={post.title}
                className="mt-8 w-full rounded-2xl object-cover max-h-96"
              />
            )}

            {/* Excerpt */}
            <p className="mt-8 text-lg text-slate-600 leading-relaxed font-medium border-l-4 border-indigo-200 pl-4">
              {post.excerpt}
            </p>

            {/* Content */}
            {post.content ? (
              <div
                className="prose prose-slate prose-lg mt-8 max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="mt-8 text-slate-500 italic">Full article coming soon.</p>
            )}

            {/* Footer nav */}
            <div className="mt-14 border-t border-slate-200 pt-8 flex justify-between">
              <Link to="/blog" className="btn-outline px-5 py-2.5 flex items-center gap-2">
                <FiArrowLeft /> All Articles
              </Link>
            </div>
          </div>
        </article>
      )}

      <PublicFooter />
    </>
  );
}
