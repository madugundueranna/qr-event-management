// src/pages/public/ReportIssue.jsx

import { useState, useRef } from "react";
import { FiUpload, FiX, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import PublicNavbar from "../../components/layout/PublicNavbar";
import PublicFooter from "../../components/layout/PublicFooter";
import { submitReportIssue } from "../../api/enquiryApi";

const ISSUE_TYPES = [
  "Payment / Billing Problem",
  "Ticket Not Received",
  "QR Code Not Scanning",
  "Login / Account Issue",
  "Event Information Incorrect",
  "App / Website Bug",
  "Organiser Misconduct",
  "Other",
];

const INITIAL = { issueType: "", description: "" };

export default function ReportIssue() {
  const [form, setForm]         = useState(INITIAL);
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const fileRef = useRef(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Screenshot must be under 5 MB."); return; }
    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.issueType) { setError("Please select an issue type."); return; }
    if (!form.description.trim()) { setError("Please describe the issue."); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("issueType", form.issueType);
      fd.append("description", form.description);
      if (screenshot) fd.append("screenshot", screenshot);

      await submitReportIssue(fd);
      setSuccess(true);
      setForm(INITIAL);
      clearScreenshot();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-gradient-to-r from-rose-600 to-red-700 py-20 text-white">
        <div className="container-page text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <FiAlertTriangle className="text-2xl" />
          </div>
          <h1 className="text-5xl font-black">Report an Issue</h1>
          <p className="mt-4 text-white/80 text-lg max-w-lg mx-auto">
            Found a bug or encountered a problem? Let us know and we'll fix it fast.
          </p>
        </div>
      </section>

      <main className="container-page py-16">
        <div className="mx-auto max-w-2xl">
          {success ? (
            <div className="glass-card flex flex-col items-center py-16 text-center">
              <FiCheckCircle className="text-5xl text-green-500 mb-4" />
              <h2 className="text-2xl font-black text-slate-900">Report Submitted</h2>
              <p className="mt-3 text-slate-500 max-w-sm">
                Thank you for helping us improve QREventix. Our team will investigate and reach out
                if we need more information.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 btn-primary px-6 py-2.5"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
              <h2 className="text-xl font-black text-slate-900">Issue Details</h2>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Issue Type */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="issueType"
                  value={form.issueType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select issue type…</option>
                  {ISSUE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what happened, what you expected, and any steps to reproduce the issue…"
                  rows={6}
                  className="form-input resize-none"
                  required
                />
              </div>

              {/* Screenshot */}
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Screenshot <span className="text-slate-400 font-normal">(optional)</span>
                </label>

                {preview ? (
                  <div className="relative w-fit">
                    <img
                      src={preview}
                      alt="Screenshot preview"
                      className="max-h-48 rounded-xl border border-slate-200 object-contain"
                    />
                    <button
                      type="button"
                      onClick={clearScreenshot}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-400 transition hover:border-indigo-300 hover:text-indigo-500"
                  >
                    <FiUpload className="text-2xl" />
                    <span className="text-sm font-medium">Click to upload screenshot</span>
                    <span className="text-xs">PNG, JPG, WEBP — max 5 MB</span>
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60"
              >
                {loading ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Submitting…</>
                ) : (
                  "Submit Report"
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
