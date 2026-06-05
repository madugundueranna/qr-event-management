// src/pages/admin/AdminProperties.jsx  →  Manage Events

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiEye,
  FiSearch,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { getEvents, updateEvent, updateEventStatus } from "../../api/eventApi";

const CATEGORIES = ["Music", "Tech", "Sports", "Arts", "Conference", "Comedy", "Workshop", "Food & Drink"];
const CITIES = ["Bangalore", "Hyderabad", "Mumbai", "Chennai", "Pune", "Delhi NCR", "Kolkata"];
const STATUSES = ["Active", "Under Review", "Rejected", "Completed"];
const TIERS_LIST = ["Free", "General", "VIP", "Early Bird", "Group Package"];
const PERKS_LIST = ["Wi-Fi", "Parking", "Lunch Included", "Certificate", "Networking", "Kit Bag", "VIP Lounge", "Food Courts", "Live Streaming"];
const CONTACT_TIMES = ["Morning (9-12)", "Afternoon (12-4)", "Evening (4-7)", "Night (8-11)"];

const statusColors = {
  Active:         "bg-green-100 text-green-700",
  "Under Review": "bg-orange-100 text-orange-700",
  Rejected:       "bg-red-100 text-red-700",
  Completed:      "bg-slate-100 text-slate-600",
};

const statusIcons = {
  Active:         <FiCheckCircle />,
  "Under Review": <FiClock />,
  Rejected:       <FiXCircle />,
  Completed:      <FiEye />,
};

const EMPTY_FORM = {
  title: "", type: "", city: "", venue: "", address: "",
  date: "", time: "", endTime: "", price: "", priceLabel: "",
  capacity: "", description: "", status: "",
};

export default function AdminProperties() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit modal state
  const [editEvent, setEditEvent] = useState(null); // the event being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadEvents = () => {
    setLoading(true);
    getEvents({ status: "All" })
      .then((res) => { if (res.data) setEvents(res.data); })
      .catch(() => setError("Failed to fetch events from database."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const handleStatusChange = async (eventId, newStatus) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await updateEventStatus(eventId, newStatus);
      if (res.success) {
        setEvents((prev) =>
          prev.map((ev) => ((ev._id || ev.id) === eventId ? { ...ev, status: newStatus } : ev))
        );
      } else {
        setError(res.message || "Failed to update status.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while updating status.");
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = (ev) => {
    setEditEvent(ev);
    setForm({
      title:       ev.title       || "",
      type:        ev.type        || "",
      city:        ev.city        || "",
      venue:       ev.venue       || "",
      address:     ev.address     || "",
      date:        ev.date        || "",
      time:        ev.time        || "",
      endTime:     ev.endTime     || "",
      price:       ev.price != null ? String(ev.price) : "",
      priceLabel:  ev.priceLabel  || "",
      capacity:    ev.capacity != null ? String(ev.capacity) : "",
      description: ev.description || "",
      status:      ev.status      || "Under Review",
    });
    setSaveError("");
    setSaveSuccess(false);
  };

  const closeEdit = () => {
    setEditEvent(null);
    setForm(EMPTY_FORM);
    setSaveError("");
    setSaveSuccess(false);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setSaveError("Event title is required."); return; }
    if (!form.type)          { setSaveError("Category is required."); return; }

    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess(false);

    const id = editEvent._id || editEvent.id;
    const payload = {
      ...form,
      price: form.price !== "" ? Number(form.price) : 0,
      capacity: form.capacity !== "" ? Number(form.capacity) : 0,
      location: form.venue && form.city ? `${form.venue}, ${form.city}` : (form.venue || form.city || ""),
      priceLabel: form.price && Number(form.price) > 0
        ? `₹${Number(form.price).toLocaleString("en-IN")}`
        : "Free",
    };

    try {
      const res = await updateEvent(id, payload);
      if (res.success) {
        setEvents((prev) =>
          prev.map((ev) => ((ev._id || ev.id) === id ? { ...ev, ...payload, _id: id, id } : ev))
        );
        setSaveSuccess(true);
        setTimeout(closeEdit, 900);
      } else {
        setSaveError(res.message || "Failed to update event.");
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || "An error occurred.");
    } finally {
      setSaveLoading(false);
    }
  };

  const filtered = events.filter((ev) => {
    const matchSearch =
      (ev.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (ev.location || "").toLowerCase().includes(search.toLowerCase()) ||
      (ev._id || ev.id || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || ev.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <PublicNavbar />

      <main className="container-page py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Manage Events</h1>
            <p className="mt-1 text-slate-500">
              Review, approve, and manage all listed events on the platform.
            </p>
          </div>
          <Link to="/admin" className="text-xs font-bold text-indigo-600 hover:underline">
            ← Back to Admin 
          </Link>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200 mb-6 font-semibold">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="glass-card mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="form-input pl-11"
              placeholder="Search by ID, title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Active", "Under Review", "Rejected", "Completed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="text-center py-20 bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="text-slate-400 text-sm mt-3">Loading platform events...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500">
                    <th className="p-4 font-semibold">Event Title</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Location</th>
                    <th className="p-4 font-semibold">Price</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Views</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ev) => (
                    <tr
                      key={ev._id || ev.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="h-10 w-14 rounded-lg object-cover bg-slate-100"
                          />
                          <span className="font-semibold">{ev.title}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                          {ev.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{ev.location}</td>
                      <td className="p-4 font-bold text-indigo-700">{ev.priceLabel}</td>
                      <td className="p-4">
                        <span
                          className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                            statusColors[ev.status] || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statusIcons[ev.status]}
                          {ev.status || "Under Review"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{ev.views || 0}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link to={`/events/${ev._id || ev.id}`}>
                            <button className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100">
                              View
                            </button>
                          </Link>
                          <button
                            onClick={() => openEdit(ev)}
                            className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-100"
                          >
                            <FiEdit2 size={12} /> Edit
                          </button>
                          {ev.status !== "Active" && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleStatusChange(ev._id || ev.id, "Active")}
                              className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-green-100 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {ev.status !== "Rejected" && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleStatusChange(ev._id || ev.id, "Rejected")}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400">
                        <MdQrCode2 className="mx-auto mb-3 text-4xl opacity-30" />
                        No events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Edit Modal ── */}
      {editEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-black text-slate-800">Edit Event</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{editEvent._id || editEvent.id}</p>
              </div>
              <button
                onClick={closeEdit}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {saveError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 font-semibold">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-600 font-semibold">
                  Event updated successfully!
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Event Title *</label>
                <input
                  className="form-input text-sm"
                  value={form.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="Event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Category *</label>
                  <select
                    className="form-select text-sm"
                    value={form.type}
                    onChange={(e) => handleFormChange("type", e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>
                  <select
                    className="form-select text-sm"
                    value={form.status}
                    onChange={(e) => handleFormChange("status", e.target.value)}
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">City</label>
                  <select
                    className="form-select text-sm"
                    value={form.city}
                    onChange={(e) => handleFormChange("city", e.target.value)}
                  >
                    <option value="">Select City</option>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Venue */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Venue</label>
                  <input
                    className="form-input text-sm"
                    value={form.venue}
                    onChange={(e) => handleFormChange("venue", e.target.value)}
                    placeholder="Venue name"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Address</label>
                <input
                  className="form-input text-sm"
                  value={form.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  placeholder="Full venue address"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Date</label>
                  <input
                    type="date"
                    className="form-input text-sm"
                    value={form.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Start Time</label>
                  <input
                    type="time"
                    className="form-input text-sm"
                    value={form.time}
                    onChange={(e) => handleFormChange("time", e.target.value)}
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">End Time</label>
                  <input
                    type="time"
                    className="form-input text-sm"
                    value={form.endTime}
                    onChange={(e) => handleFormChange("endTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Price (₹, 0 = Free)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input text-sm"
                    value={form.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                    placeholder="0"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input text-sm"
                    value={form.capacity}
                    onChange={(e) => handleFormChange("capacity", e.target.value)}
                    placeholder="500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  value={form.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Event description..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
              <button
                onClick={closeEdit}
                className="btn-outline px-5 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
              >
                {saveLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
