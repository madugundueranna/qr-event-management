import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus, FiEdit2, FiTrash2, FiChevronLeft, FiCheck, FiX,
  FiToggleLeft, FiToggleRight, FiSave, FiLoader,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  adminGetCareers, adminCreateCareer, adminUpdateCareer, adminDeleteCareer,
  adminGetBlogPosts, adminCreateBlogPost, adminUpdateBlogPost, adminDeleteBlogPost,
  adminGetPressItems, adminCreatePressItem, adminUpdatePressItem, adminDeletePressItem,
  adminGetFAQs, adminCreateFAQ, adminUpdateFAQ, adminDeleteFAQ,
  adminGetAbout, adminUpdateAbout,
  adminGetContactInfo, adminUpdateContactInfo,
} from "../../api/adminApi";

// ─── Shared helpers ───────────────────────────────────────────────────────────
const TABS = ["About", "Careers", "Blog", "Press", "Help FAQ", "Contact Info"];

function Spinner() {
  return (
    <div className="flex h-40 items-center justify-center">
      <FiLoader className="animate-spin text-3xl text-indigo-500" />
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="py-14 text-center text-slate-400">
      <p className="text-lg font-bold">No {label} yet</p>
      <p className="mt-1 text-sm">Click "Add New" to create the first one.</p>
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

// ─── Generic list manager (Careers / Blog / Press / FAQ) ─────────────────────
function ListManager({ items, loading, columns, renderRow, onAdd, onEdit, onDelete, addLabel = "Add New" }) {
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={onAdd} className="btn-primary flex items-center gap-2 px-4 py-2">
          <FiPlus /> {addLabel}
        </button>
      </div>

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState label={addLabel} /> : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{c}</th>
                ))}
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition">
                  {renderRow(item)}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(item)} className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                        <FiEdit2 size={15} />
                      </button>
                      <button onClick={() => setConfirmId(item._id)} className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                        <FiTrash2 size={15} />
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
          message="Delete this item? This cannot be undone."
          onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-10 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"><FiX /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition";
const ta  = `${inp} resize-none`;

// ══════════════════════════════════════════════════════════════════════════════
// CAREERS TAB
// ══════════════════════════════════════════════════════════════════════════════
const CAREER_EMPTY = { title: "", department: "", location: "", type: "Full-time", description: "", applicationEmail: "careers@qreventix.in", isActive: true };

function CareersTab() {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null); // null | { mode, data }
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState(CAREER_EMPTY);
  const [error, setError]   = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminGetCareers().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(CAREER_EMPTY); setError(""); setModal({ mode: "add" }); };
  const openEdit = (item) => { setForm({ ...item }); setError(""); setModal({ mode: "edit", id: item._id }); };

  const handleSave = async () => {
    if (!form.title || !form.department || !form.location || !form.description) {
      setError("Title, department, location, and description are required."); return;
    }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") await adminCreateCareer(form);
      else await adminUpdateCareer(modal.id, form);
      setModal(null); load();
    } catch { setError("Save failed. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await adminDeleteCareer(id); load();
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <ListManager
        items={items} loading={loading}
        columns={["Title", "Department", "Location", "Type", "Status"]}
        renderRow={(item) => (
          <>
            <td className="px-4 py-3 font-medium text-slate-800">{item.title}</td>
            <td className="px-4 py-3 text-slate-500">{item.department}</td>
            <td className="px-4 py-3 text-slate-500">{item.location}</td>
            <td className="px-4 py-3 text-slate-500">{item.type}</td>
            <td className="px-4 py-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {item.isActive ? "Active" : "Inactive"}
              </span>
            </td>
          </>
        )}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete}
        addLabel="Add Job"
      />

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Job Opening" : "Edit Job Opening"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job Title" required><input value={form.title} onChange={set("title")} className={inp} placeholder="e.g. Backend Engineer" /></Field>
              <Field label="Department" required><input value={form.department} onChange={set("department")} className={inp} placeholder="e.g. Engineering" /></Field>
              <Field label="Location" required><input value={form.location} onChange={set("location")} className={inp} placeholder="e.g. Bangalore, IN" /></Field>
              <Field label="Type">
                <select value={form.type} onChange={set("type")} className={inp}>
                  {["Full-time", "Part-time", "Contract", "Internship"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Description" required><textarea value={form.description} onChange={set("description")} className={ta} rows={4} placeholder="Role overview and requirements..." /></Field>
            <Field label="Application Email"><input value={form.applicationEmail} onChange={set("applicationEmail")} className={inp} /></Field>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded" />
              <span className="text-sm font-medium text-slate-700">Active (visible on public Careers page)</span>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setModal(null)} className="btn-outline px-5 py-2">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2 disabled:opacity-60">
              {saving ? <><FiLoader className="animate-spin" /> Saving…</> : <><FiSave /> Save</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BLOG TAB
// ══════════════════════════════════════════════════════════════════════════════
const BLOG_EMPTY = { title: "", slug: "", excerpt: "", content: "", author: "", date: "", category: "Events", readTime: "5 min read", coverImageUrl: "", isPublished: true };
const BLOG_CATS  = ["Technology", "Events", "Organiser Tips", "Industry", "Research", "Product"];

function BlogTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState(BLOG_EMPTY);
  const [error, setError]     = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminGetBlogPosts().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(BLOG_EMPTY); setError(""); setModal({ mode: "add" }); };
  const openEdit = (item) => {
    setForm({ ...item, coverImageUrl: item.coverImage?.url || "" });
    setError(""); setModal({ mode: "edit", id: item._id });
  };

  const handleSave = async () => {
    if (!form.title || !form.excerpt || !form.author) {
      setError("Title, excerpt, and author are required."); return;
    }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") await adminCreateBlogPost(form);
      else await adminUpdateBlogPost(modal.id, form);
      setModal(null); load();
    } catch { setError("Save failed. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { await adminDeleteBlogPost(id); load(); };
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <ListManager
        items={items} loading={loading}
        columns={["Title", "Category", "Author", "Date", "Status"]}
        renderRow={(item) => (
          <>
            <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{item.title}</td>
            <td className="px-4 py-3 text-slate-500">{item.category}</td>
            <td className="px-4 py-3 text-slate-500">{item.author}</td>
            <td className="px-4 py-3 text-slate-500">{item.date}</td>
            <td className="px-4 py-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isPublished ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                {item.isPublished ? "Published" : "Draft"}
              </span>
            </td>
          </>
        )}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete}
        addLabel="Add Post"
      />

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Blog Post" : "Edit Blog Post"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{error}</p>}
            <Field label="Title" required><input value={form.title} onChange={set("title")} className={inp} placeholder="Post title" /></Field>
            <Field label="Slug (leave blank to auto-generate)"><input value={form.slug} onChange={set("slug")} className={inp} placeholder="my-post-slug" /></Field>
            <Field label="Excerpt" required><textarea value={form.excerpt} onChange={set("excerpt")} className={ta} rows={2} placeholder="Short summary for listing pages..." /></Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Author" required><input value={form.author} onChange={set("author")} className={inp} /></Field>
              <Field label="Date"><input type="date" value={form.date} onChange={set("date")} className={inp} /></Field>
              <Field label="Read Time"><input value={form.readTime} onChange={set("readTime")} className={inp} placeholder="5 min read" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select value={form.category} onChange={set("category")} className={inp}>
                  {BLOG_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Cover Image URL"><input value={form.coverImageUrl} onChange={set("coverImageUrl")} className={inp} placeholder="https://..." /></Field>
            </div>
            <Field label="Content (HTML)">
              <textarea value={form.content} onChange={set("content")} className={ta} rows={8} placeholder="<p>Article HTML content…</p>" />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))} className="rounded" />
              <span className="text-sm font-medium text-slate-700">Published (visible on public Blog page)</span>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setModal(null)} className="btn-outline px-5 py-2">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2 disabled:opacity-60">
              {saving ? <><FiLoader className="animate-spin" /> Saving…</> : <><FiSave /> Save</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PRESS TAB
// ══════════════════════════════════════════════════════════════════════════════
const PRESS_EMPTY = { publication: "", headline: "", summary: "", date: "", logo: "", logoColor: "#4f46e5", link: "" };

function PressTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState(PRESS_EMPTY);
  const [error, setError]     = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminGetPressItems().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(PRESS_EMPTY); setError(""); setModal({ mode: "add" }); };
  const openEdit = (item) => { setForm({ ...item }); setError(""); setModal({ mode: "edit", id: item._id }); };

  const handleSave = async () => {
    if (!form.publication || !form.headline || !form.summary) {
      setError("Publication, headline, and summary are required."); return;
    }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") await adminCreatePressItem(form);
      else await adminUpdatePressItem(modal.id, form);
      setModal(null); load();
    } catch { setError("Save failed. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { await adminDeletePressItem(id); load(); };
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <ListManager
        items={items} loading={loading}
        columns={["Publication", "Headline", "Date"]}
        renderRow={(item) => (
          <>
            <td className="px-4 py-3 font-medium text-slate-800">{item.publication}</td>
            <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{item.headline}</td>
            <td className="px-4 py-3 text-slate-500">{item.date}</td>
          </>
        )}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete}
        addLabel="Add Press Item"
      />

      {modal && (
        <Modal title={modal.mode === "add" ? "Add Press Item" : "Edit Press Item"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Publication" required><input value={form.publication} onChange={set("publication")} className={inp} placeholder="e.g. TechCrunch" /></Field>
              <Field label="Date"><input type="date" value={form.date} onChange={set("date")} className={inp} /></Field>
            </div>
            <Field label="Headline" required><input value={form.headline} onChange={set("headline")} className={inp} placeholder="Article headline..." /></Field>
            <Field label="Summary" required><textarea value={form.summary} onChange={set("summary")} className={ta} rows={3} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Logo Text / Abbreviation"><input value={form.logo} onChange={set("logo")} className={inp} placeholder="TC" /></Field>
              <Field label="Logo Color">
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.logoColor} onChange={set("logoColor")} className="h-10 w-14 rounded-lg border border-slate-200 cursor-pointer" />
                  <input value={form.logoColor} onChange={set("logoColor")} className={inp} placeholder="#4f46e5" />
                </div>
              </Field>
            </div>
            <Field label="Article Link"><input value={form.link} onChange={set("link")} className={inp} placeholder="https://..." /></Field>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setModal(null)} className="btn-outline px-5 py-2">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2 disabled:opacity-60">
              {saving ? <><FiLoader className="animate-spin" /> Saving…</> : <><FiSave /> Save</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HELP FAQ TAB
// ══════════════════════════════════════════════════════════════════════════════
const FAQ_CATS   = ["Tickets & Booking", "Payments & Refunds", "For Event Organisers", "Account & Privacy"];
const FAQ_EMPTY  = { category: "Tickets & Booking", question: "", answer: "", order: 0, isActive: true };

function HelpFAQTab() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState(FAQ_EMPTY);
  const [error, setError]     = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminGetFAQs().then(setItems).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(FAQ_EMPTY); setError(""); setModal({ mode: "add" }); };
  const openEdit = (item) => { setForm({ ...item }); setError(""); setModal({ mode: "edit", id: item._id }); };

  const handleSave = async () => {
    if (!form.category || !form.question || !form.answer) {
      setError("Category, question, and answer are required."); return;
    }
    setSaving(true); setError("");
    try {
      if (modal.mode === "add") await adminCreateFAQ(form);
      else await adminUpdateFAQ(modal.id, form);
      setModal(null); load();
    } catch { setError("Save failed. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { await adminDeleteFAQ(id); load(); };
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <>
      <ListManager
        items={items} loading={loading}
        columns={["Category", "Question", "Order", "Status"]}
        renderRow={(item) => (
          <>
            <td className="px-4 py-3 text-slate-500">{item.category}</td>
            <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{item.question}</td>
            <td className="px-4 py-3 text-slate-500">{item.order}</td>
            <td className="px-4 py-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {item.isActive ? "Active" : "Hidden"}
              </span>
            </td>
          </>
        )}
        onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete}
        addLabel="Add FAQ"
      />

      {modal && (
        <Modal title={modal.mode === "add" ? "Add FAQ" : "Edit FAQ"} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" required>
                <select value={form.category} onChange={set("category")} className={inp}>
                  {FAQ_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Display Order">
                <input type="number" min={0} value={form.order} onChange={set("order")} className={inp} />
              </Field>
            </div>
            <Field label="Question" required><input value={form.question} onChange={set("question")} className={inp} placeholder="Frequently asked question..." /></Field>
            <Field label="Answer" required><textarea value={form.answer} onChange={set("answer")} className={ta} rows={4} placeholder="Answer text..." /></Field>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded" />
              <span className="text-sm font-medium text-slate-700">Active (visible on public Help Center)</span>
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setModal(null)} className="btn-outline px-5 py-2">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2 disabled:opacity-60">
              {saving ? <><FiLoader className="animate-spin" /> Saving…</> : <><FiSave /> Save</>}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ABOUT TAB  (singleton form)
// ══════════════════════════════════════════════════════════════════════════════
const ABOUT_EMPTY = { heroTagline: "", storyParagraphs: [], values: [], team: [], stats: [] };

function AboutTab() {
  const [data, setData]       = useState(ABOUT_EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  // helpers for string arrays (storyParagraphs)
  const storyText = data.storyParagraphs?.join("\n\n") || "";
  const setStory  = (val) => setData((p) => ({ ...p, storyParagraphs: val.split("\n\n").map((s) => s.trim()).filter(Boolean) }));

  // helpers for array fields (values / team / stats)
  const setArr = (key) => (newArr) => setData((p) => ({ ...p, [key]: newArr }));

  useEffect(() => {
    adminGetAbout().then((d) => { if (d && d._id) setData(d); }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      await adminUpdateAbout(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError("Save failed. Please try again."); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 max-w-3xl">
      {error  && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      {saved  && <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700 flex items-center gap-2"><FiCheck /> Saved successfully!</p>}

      <Field label="Hero Tagline">
        <input value={data.heroTagline || ""} onChange={(e) => setData((p) => ({ ...p, heroTagline: e.target.value }))} className={inp} placeholder="The tagline shown on the About page hero..." />
      </Field>

      <Field label="Story Paragraphs (separate each paragraph with a blank line)">
        <textarea value={storyText} onChange={(e) => setStory(e.target.value)} className={ta} rows={8} placeholder="First paragraph...&#10;&#10;Second paragraph..." />
      </Field>

      <ArrayEditor
        label="Values"
        items={data.values || []}
        onChange={setArr("values")}
        fields={[
          { key: "icon",  label: "Icon Name", placeholder: "FiTarget" },
          { key: "title", label: "Title",     placeholder: "Our Mission" },
          { key: "body",  label: "Body",      placeholder: "Description...", multiline: true },
        ]}
        emptyItem={{ icon: "", title: "", body: "" }}
      />

      <ArrayEditor
        label="Team Members"
        items={data.team || []}
        onChange={setArr("team")}
        fields={[
          { key: "name", label: "Name",       placeholder: "Arjun Sharma" },
          { key: "role", label: "Role",       placeholder: "CEO & Co-founder" },
          { key: "city", label: "City",       placeholder: "Bangalore" },
          { key: "bio",  label: "Short Bio",  placeholder: "...", multiline: true },
        ]}
        emptyItem={{ name: "", role: "", city: "", bio: "" }}
      />

      <ArrayEditor
        label="Stats"
        items={data.stats || []}
        onChange={setArr("stats")}
        fields={[
          { key: "number", label: "Number", placeholder: "500K+" },
          { key: "label",  label: "Label",  placeholder: "Tickets Sold" },
        ]}
        emptyItem={{ number: "", label: "" }}
      />

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-60">
          {saving ? <><FiLoader className="animate-spin" /> Saving…</> : <><FiSave /> Save About Content</>}
        </button>
      </div>
    </div>
  );
}

function ArrayEditor({ label, items, onChange, fields, emptyItem }) {
  const update = (idx, key, val) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [key]: val };
    onChange(copy);
  };
  const add    = () => onChange([...items, { ...emptyItem }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <button onClick={add} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold">
          <FiPlus size={12} /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-400 italic">No {label.toLowerCase()} added yet.</p>}
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
            <button onClick={() => remove(idx)} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition">
              <FiX size={14} />
            </button>
            <div className="grid gap-3 sm:grid-cols-2 pr-6">
              {fields.map(({ key, label: fl, placeholder, multiline }) =>
                multiline ? (
                  <div key={key} className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-500">{fl}</label>
                    <textarea value={item[key] || ""} onChange={(e) => update(idx, key, e.target.value)} className={ta} rows={2} placeholder={placeholder} />
                  </div>
                ) : (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-semibold text-slate-500">{fl}</label>
                    <input value={item[key] || ""} onChange={(e) => update(idx, key, e.target.value)} className={inp} placeholder={placeholder} />
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTACT INFO TAB  (singleton form)
// ══════════════════════════════════════════════════════════════════════════════
const CI_EMPTY = { address: "", phone: "", phoneHours: "", email: "", emailResponseTime: "", pressEmail: "", partnershipsEmail: "" };

function ContactInfoTab() {
  const [data, setData]       = useState(CI_EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    adminGetContactInfo().then((d) => { if (d && d._id) setData(d); }).finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setData((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      await adminUpdateContactInfo(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setError("Save failed. Please try again."); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4 max-w-2xl">
      {error && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      {saved && <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700 flex items-center gap-2"><FiCheck /> Saved!</p>}

      <Field label="Office Address"><input value={data.address} onChange={set("address")} className={inp} placeholder="No. 12, Brigade Road..." /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone"><input value={data.phone} onChange={set("phone")} className={inp} placeholder="+91 80 4120 5000" /></Field>
        <Field label="Phone Hours"><input value={data.phoneHours} onChange={set("phoneHours")} className={inp} placeholder="Mon–Fri, 10 AM–7 PM IST" /></Field>
        <Field label="Support Email"><input type="email" value={data.email} onChange={set("email")} className={inp} /></Field>
        <Field label="Email Response Time"><input value={data.emailResponseTime} onChange={set("emailResponseTime")} className={inp} placeholder="Within 24 hours" /></Field>
        <Field label="Press Email"><input type="email" value={data.pressEmail} onChange={set("pressEmail")} className={inp} /></Field>
        <Field label="Partnerships Email"><input type="email" value={data.partnershipsEmail} onChange={set("partnershipsEmail")} className={inp} /></Field>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-60">
          {saving ? <><FiLoader className="animate-spin" /> Saving…</> : <><FiSave /> Save Contact Info</>}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = async () => { await logout(); navigate("/login", { replace: true }); };

  const tabContent = [
    <AboutTab />,
    <CareersTab />,
    <BlogTab />,
    <PressTab />,
    <HelpFAQTab />,
    <ContactInfoTab />,
  ];

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
            <h1 className="text-lg font-black text-slate-900">Content Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user?.name}</span>
            <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-500 transition">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tab bar */}
        <div className="mb-8 flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-soft w-fit">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === i
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-soft">
          <h2 className="mb-6 text-xl font-black text-slate-900">{TABS[activeTab]}</h2>
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}
