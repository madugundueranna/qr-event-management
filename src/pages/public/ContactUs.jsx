import { useState, useEffect } from "react";
import { FiMail, FiMapPin, FiPhone, FiSend, FiCheckCircle } from "react-icons/fi";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { submitContactEnquiry } from "../../api/enquiryApi";
import { getContactInfo } from "../../api/contentApi";

const INITIAL = { name: "", email: "", message: "" };

export default function ContactUs() {
  const [form, setForm]       = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");
  const [info, setInfo]       = useState(null);

  useEffect(() => {
    getContactInfo().then(setInfo);
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await submitContactEnquiry(form);
      setSuccess(true);
      setForm(INITIAL);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const address   = info?.address   || "No. 12, Brigade Road, Bangalore – 560025, Karnataka";
  const phone     = info?.phone     || "+91 80 4120 5000";
  const phoneHrs  = info?.phoneHours || "Mon – Fri, 10 AM – 7 PM IST";
  const email     = info?.email     || "support@qreventix.in";
  const emailRsp  = info?.emailResponseTime || "Response within 24 hours";
  const pressEmail = info?.pressEmail || "press@qreventix.in";
  const partEmail  = info?.partnershipsEmail || "partnerships@qreventix.in";

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-indigo-600 to-violet-700 py-20 text-white">
        <div className="container-page text-center">
          <h1 className="text-5xl font-black">Contact Us</h1>
          <p className="mt-4 text-white/80 text-lg">
            We'd love to hear from you. Our team responds within 24 hours.
          </p>
        </div>
      </section>

      <main className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          {/* Info column */}
          <div>
            <h2 className="text-2xl font-black text-slate-900">Get in Touch</h2>
            <p className="mt-4 text-slate-500 leading-relaxed">
              Whether you have a question about an event, need help with a booking, want to
              become an organiser, or just want to say hello — we're here.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                  <FiMapPin className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Office Address</p>
                  <p className="mt-1 text-sm text-slate-500">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                  <FiPhone className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Phone</p>
                  <p className="mt-1 text-sm text-slate-500">{phone}</p>
                  <p className="text-xs text-slate-400">{phoneHrs}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                  <FiMail className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Email</p>
                  <a href={`mailto:${email}`} className="mt-1 text-sm text-indigo-600 hover:underline">
                    {email}
                  </a>
                  <p className="text-xs text-slate-400 mt-0.5">{emailRsp}</p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="mt-10 rounded-2xl bg-slate-50 p-6">
              <p className="font-bold text-slate-800 mb-3">Quick Links</p>
              <ul className="space-y-2 text-sm">
                <li><a href="/help" className="text-indigo-600 hover:underline">Help Center & FAQs</a></li>
                <li><a href="/report-issue" className="text-indigo-600 hover:underline">Report a Technical Issue</a></li>
                <li><a href={`mailto:${pressEmail}`} className="text-indigo-600 hover:underline">Press & Media Enquiries</a></li>
                <li><a href={`mailto:${partEmail}`} className="text-indigo-600 hover:underline">Partnership Opportunities</a></li>
              </ul>
            </div>
          </div>

          {/* Form column */}
          <div className="glass-card p-8">
            {success ? (
              <div className="flex flex-col items-center py-12 text-center">
                <FiCheckCircle className="text-5xl text-green-500 mb-4" />
                <h3 className="text-2xl font-black text-slate-900">Message Sent!</h3>
                <p className="mt-3 text-slate-500">
                  Thanks for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 btn-primary px-6 py-2.5"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-black text-slate-900">Send Us a Message</h2>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ravi Kumar"
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="ravi@example.com"
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    rows={6}
                    className="form-input resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60"
                >
                  {loading ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Sending…</>
                  ) : (
                    <><FiSend /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
