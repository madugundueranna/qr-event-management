// src/pages/admin/AdminCategories.jsx  →  Admin: manage cities & event categories

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiChevronDown, FiEdit2, FiEyeOff, FiEye,
  FiMapPin, FiPlus, FiTag, FiTrash2, FiX, FiCheck,
} from "react-icons/fi";
import {
  getCities, createCity, updateCity, deleteCity,
  getAdminEventCategories, createEventCategory, updateEventCategory,
  toggleEventCategory, deleteEventCategory,
} from "../../api/categoryApi";

// ── Shared list section ───────────────────────────────────────────────────────
function ManageSection({ title, icon, color, items, loading, onAdd, onEdit, onDelete, onToggle }) {
  const [addVal, setAddVal] = useState("");
  const [addErr, setAddErr] = useState("");
  const [adding, setAdding] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [editErr, setEditErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  const addInputRef = useRef(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    const val = addVal.trim();
    if (!val) { setAddErr("Name cannot be empty."); return; }
    if (val.length > 100) { setAddErr("Max 100 characters."); return; }
    setAdding(true); setAddErr("");
    const err = await onAdd(val);
    setAdding(false);
    if (err) { setAddErr(err); } else { setAddVal(""); }
  };

  const startEdit = (item) => { setEditId(item._id); setEditVal(item.name); setEditErr(""); };
  const cancelEdit = () => { setEditId(null); setEditVal(""); setEditErr(""); };

  const handleSave = async (id) => {
    const val = editVal.trim();
    if (!val) { setEditErr("Name cannot be empty."); return; }
    if (val.length > 100) { setEditErr("Max 100 characters."); return; }
    setSaving(true); setEditErr("");
    const err = await onEdit(id, val);
    setSaving(false);
    if (err) { setEditErr(err); } else { cancelEdit(); }
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    await onToggle(id);
    setTogglingId(null);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    const err = await onDelete(id);
    setDeleting(false);
    if (err) { setDeleteConfirm({ id, err }); } else { setDeleteConfirm(null); }
  };

  const activeCount = items.filter((i) => i.isActive !== false).length;

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${color}`}>
            {icon}
          </div>
          <div>
            <h2 className="font-black text-ink-900">{title}</h2>
            <p className="text-xs text-slate-400">
              {items.length} total
              {onToggle && ` · ${activeCount} active`}
            </p>
          </div>
        </div>
        {onToggle && (
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">
            {activeCount} shown in dropdown
          </span>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No items yet. Add one below.</p>
      ) : (
        <ul className="mb-4 divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
          {items.map((item) => {
            const inactive = item.isActive === false;
            return (
              <li
                key={item._id}
                className={`flex items-center gap-3 px-4 py-3 transition ${inactive ? "bg-slate-50" : "bg-white"}`}
              >
                {editId === item._id ? (
                  <>
                    <div className="flex-1 space-y-1">
                      <input
                        autoFocus
                        className="form-input py-1.5 text-sm"
                        value={editVal}
                        maxLength={100}
                        onChange={(e) => setEditVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSave(item._id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      {editErr && <p className="text-xs text-red-500">{editErr}</p>}
                    </div>
                    <button
                      disabled={saving}
                      onClick={() => handleSave(item._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <FiCheck />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                    >
                      <FiX />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Active/inactive dot (categories only) */}
                    {onToggle && (
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${inactive ? "bg-slate-300" : "bg-green-500"}`}
                        title={inactive ? "Inactive" : "Active"}
                      />
                    )}
                    <span className={`flex-1 text-sm font-semibold ${inactive ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {item.name}
                    </span>
                    {inactive && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                        Hidden
                      </span>
                    )}
                    <button
                      onClick={() => startEdit(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                      title="Rename"
                    >
                      <FiEdit2 />
                    </button>
                    {onToggle && (
                      <button
                        disabled={togglingId === item._id}
                        onClick={() => handleToggle(item._id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-40 ${
                          inactive
                            ? "text-slate-400 hover:bg-green-50 hover:text-green-600"
                            : "text-slate-400 hover:bg-orange-50 hover:text-orange-500"
                        }`}
                        title={inactive ? "Activate (show in dropdown)" : "Deactivate (hide from dropdown)"}
                      >
                        {inactive ? <FiEye /> : <FiEyeOff />}
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm({ id: item._id, name: item.name })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Delete confirmation / error banner */}
      {deleteConfirm && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm">
          {deleteConfirm.err ? (
            <div className="flex items-start justify-between gap-3">
              <p className="text-red-700">{deleteConfirm.err}</p>
              <button onClick={() => setDeleteConfirm(null)} className="text-red-400 hover:text-red-600 shrink-0">
                <FiX />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap gap-y-2">
              <p className="text-red-700">
                Delete <strong>"{deleteConfirm.name}"</strong>? This cannot be undone.
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  disabled={deleting}
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="flex-1 space-y-1">
          <input
            ref={addInputRef}
            className="form-input"
            placeholder={`Add new ${title === "Event Categories" ? "category" : "city"}…`}
            value={addVal}
            maxLength={100}
            onChange={(e) => { setAddVal(e.target.value); setAddErr(""); }}
          />
          {addErr && <p className="text-xs text-red-500">{addErr}</p>}
        </div>
        <button
          type="submit"
          disabled={adding}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 shrink-0"
        >
          <FiPlus /> {adding ? "Adding…" : "Add"}
        </button>
      </form>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminCategories() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const fetchCities = () => {
    setLoadingCities(true);
    getCities()
      .then((res) => setCities(res.cities || []))
      .catch(() => {})
      .finally(() => setLoadingCities(false));
  };

  const fetchCategories = () => {
    setLoadingCategories(true);
    getAdminEventCategories()
      .then((res) => setCategories(res.categories || []))
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  };

  useEffect(() => { fetchCities(); fetchCategories(); }, []);

  // ── City handlers ──
  const handleAddCity = async (name) => {
    try {
      const res = await createCity(name);
      if (res.success) { fetchCities(); return null; }
      return res.message;
    } catch (err) { return err.response?.data?.message || "Failed to add city."; }
  };

  const handleEditCity = async (id, name) => {
    try {
      const res = await updateCity(id, name);
      if (res.success) { fetchCities(); return null; }
      return res.message;
    } catch (err) { return err.response?.data?.message || "Failed to update city."; }
  };

  const handleDeleteCity = async (id) => {
    try {
      const res = await deleteCity(id);
      if (res.success) { fetchCities(); return null; }
      return res.message;
    } catch (err) { return err.response?.data?.message || "Failed to delete city."; }
  };

  // ── Category handlers ──
  const handleAddCategory = async (name) => {
    try {
      const res = await createEventCategory(name);
      if (res.success) { fetchCategories(); return null; }
      return res.message;
    } catch (err) { return err.response?.data?.message || "Failed to add category."; }
  };

  const handleEditCategory = async (id, name) => {
    try {
      const res = await updateEventCategory(id, name);
      if (res.success) { fetchCategories(); return null; }
      return res.message;
    } catch (err) { return err.response?.data?.message || "Failed to update category."; }
  };

  const handleToggleCategory = async (id) => {
    try {
      await toggleEventCategory(id);
      fetchCategories();
    } catch {}
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await deleteEventCategory(id);
      if (res.success) { fetchCategories(); return null; }
      return res.message;
    } catch (err) { return err.response?.data?.message || "Failed to delete category."; }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-lg">Q</div>
            <div>
              <p className="text-xs font-black leading-none tracking-[0.2em] text-ink-900">QREventix</p>
              <p className="text-[8px] tracking-[0.35em] text-slate-400">ADMIN</p>
            </div>
          </Link>
          <div className="mx-2 h-8 w-px bg-slate-200" />
          <div>
            <p className="font-black text-ink-900 leading-tight">Cities & Categories</p>
            <p className="text-xs text-slate-400">Manage filter options for events</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition"
          >
            ← Dashboard
          </Link>
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <FiChevronDown className="text-slate-400 text-xs" />
            </button>
            <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-slate-200 shadow-lg py-1 hidden group-hover:block z-[99]">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold disabled:opacity-50"
              >
                {loggingOut ? "Logging out…" : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-page py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-ink-900">Cities & Event Categories</h1>
          <p className="mt-1 text-slate-500 text-sm">
            Changes take effect immediately on the public events page.
            Use the <FiEyeOff className="inline" /> button to hide a category from dropdowns without deleting it.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ManageSection
            title="Cities"
            icon={<FiMapPin />}
            color="bg-indigo-50 text-indigo-600"
            items={cities}
            loading={loadingCities}
            onAdd={handleAddCity}
            onEdit={handleEditCity}
            onDelete={handleDeleteCity}
          />
          <ManageSection
            title="Event Categories"
            icon={<FiTag />}
            color="bg-violet-50 text-violet-600"
            items={categories}
            loading={loadingCategories}
            onAdd={handleAddCategory}
            onEdit={handleEditCategory}
            onToggle={handleToggleCategory}
            onDelete={handleDeleteCategory}
          />
        </div>
      </main>
    </div>
  );
}
