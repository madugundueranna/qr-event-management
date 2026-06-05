import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronLeft, FiLoader, FiTrash2, FiChevronDown, FiChevronUp,
  FiAlertCircle, FiMail, FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  adminGetEnquiries, adminUpdateEnquiryStatus, adminDeleteEnquiry,
  adminGetReports, adminUpdateReportStatus, adminDeleteReport,
} from "../../api/adminApi";

// ─── Shared ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex h-40 items-center justify-center">
      <FiLoader className="animate-spin text-3xl text-indigo-500" />
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="py-16 text-center text-slate-400">
      <p className="text-lg font-bold">No {label}</p>
      <p className="mt-1 text-sm">Submissions will appear here once users submit the form.</p>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-slate-800 font-semibold">{message}</p>
        <div className="mt-5 flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-outline px-4 py-2">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 text-white rounded-xl px-4 py-2 font-semibold hover:bg-red-700 transition">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Status badge helpers ──────────────────────────────────────────────────────
const ENQUIRY_STATUS = {
  new:      { label: "New",      cls: "bg-blue-50 text-blue-700"    },
  read:     { label: "Read",     cls: "bg-slate-100 text-slate-600" },
  resolved: { label: "Resolved", cls: "bg-green-50 text-green-700"  },
};

const REPORT_STATUS = {
  open:        { label: "Open",        cls: "bg-red-50 text-red-700"     },
  in_progress: { label: "In Progress", cls: "bg-amber-50 text-amber-700" },
  resolved:    { label: "Resolved",    cls: "bg-green-50 text-green-700" },
};

function StatusBadge({ status, map }) {
  const s = map[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

// ─── Expandable row ───────────────────────────────────────────────────────────
function ExpandRow({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen((p) => !p)} className="ml-2 text-slate-400 hover:text-indigo-600 transition">
        {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>
      {open && <div className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{children}</div>}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ENQUIRIES TAB
// ══════════════════════════════════════════════════════════════════════════════
function EnquiriesTab() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminGetEnquiries().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    setUpdating(id);
    try { await adminUpdateEnquiryStatus(id, status); load(); }
    catch { /* silent */ }
    finally { setUpdating(null); }
  };

  const doDelete = async (id) => { await adminDeleteEnquiry(id); load(); };

  const counts = Object.fromEntries(
    Object.keys(ENQUIRY_STATUS).map((s) => [s, items.filter((i) => i.status === s).length])
  );

  return (
    <>
      {/* Summary pills */}
      <div className="mb-6 flex flex-wrap gap-3">
        {Object.entries(ENQUIRY_STATUS).map(([key, { label, cls }]) => (
          <div key={key} className={`rounded-xl px-4 py-2 text-sm font-semibold ${cls}`}>
            {counts[key] || 0} {label}
          </div>
        ))}
      </div>

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState label="enquiries yet" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {["Name", "Email", "Message", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item._id} className={`hover:bg-slate-50 transition ${item.status === "new" ? "bg-blue-50/30" : ""}`}>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500">
                    <a href={`mailto:${item.email}`} className="hover:text-indigo-600 hover:underline">{item.email}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">
                    <span className="line-clamp-1">{item.message}</span>
                    <ExpandRow>{item.message}</ExpandRow>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{item.createdAt}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} map={ENQUIRY_STATUS} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={item.status}
                        disabled={updating === item._id}
                        onChange={(e) => changeStatus(item._id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 transition disabled:opacity-50"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      {updating === item._id && <FiLoader className="animate-spin text-indigo-500" size={13} />}
                      <button
                        onClick={() => setConfirmId(item._id)}
                        className="rounded-lg p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmId && (
        <ConfirmModal
          message="Delete this enquiry? This cannot be undone."
          onConfirm={() => { doDelete(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function ReportsTab() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [updating, setUpdating]   = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminGetReports().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    setUpdating(id);
    try { await adminUpdateReportStatus(id, status); load(); }
    catch { /* silent */ }
    finally { setUpdating(null); }
  };

  const doDelete = async (id) => { await adminDeleteReport(id); load(); };

  const counts = Object.fromEntries(
    Object.keys(REPORT_STATUS).map((s) => [s, items.filter((i) => i.status === s).length])
  );

  return (
    <>
      {/* Summary pills */}
      <div className="mb-6 flex flex-wrap gap-3">
        {Object.entries(REPORT_STATUS).map(([key, { label, cls }]) => (
          <div key={key} className={`rounded-xl px-4 py-2 text-sm font-semibold ${cls}`}>
            {counts[key] || 0} {label}
          </div>
        ))}
      </div>

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState label="issue reports yet" /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {["Issue Type", "Description", "Screenshot", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item._id} className={`hover:bg-slate-50 transition ${item.status === "open" ? "bg-red-50/20" : ""}`}>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{item.issueType}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-xs">
                    <span className="line-clamp-1">{item.description}</span>
                    <ExpandRow>{item.description}</ExpandRow>
                  </td>
                  <td className="px-4 py-3">
                    {item.screenshot?.url ? (
                      <a href={item.screenshot.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs">View</a>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{item.createdAt}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} map={REPORT_STATUS} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={item.status}
                        disabled={updating === item._id}
                        onChange={(e) => changeStatus(item._id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 transition disabled:opacity-50"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      {updating === item._id && <FiLoader className="animate-spin text-indigo-500" size={13} />}
                      <button
                        onClick={() => setConfirmId(item._id)}
                        className="rounded-lg p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmId && (
        <ConfirmModal
          message="Delete this report? This cannot be undone."
          onConfirm={() => { doDelete(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { label: "Contact Enquiries", icon: FiMail },
  { label: "Issue Reports",     icon: FiAlertCircle },
];

export default function AdminSubmissions() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = async () => { await logout(); navigate("/login", { replace: true }); };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition">
              <FiChevronLeft /> Dashboard
            </button>
            <span className="text-slate-200">|</span>
            <h1 className="text-lg font-black text-slate-900">Form Submissions</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.name}</span>
            <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-500 transition">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tab bar */}
        <div className="mb-8 flex gap-1 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-soft w-fit">
          {TABS.map(({ label, icon: Icon }, i) => (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === i
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-soft">
          <h2 className="mb-6 text-xl font-black text-slate-900">{TABS[activeTab].label}</h2>
          {activeTab === 0 ? <EnquiriesTab /> : <ReportsTab />}
        </div>
      </div>
    </div>
  );
}
