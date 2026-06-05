// src/pages/admin/AdminUsers.jsx  →  QREventix: Manage Users

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUserCheck, FiUserX } from "react-icons/fi";
import { MdQrCode2 } from "react-icons/md";
import PublicNavbar from "../../components/layout/PublicNavbar";
import { getUsers, updateUserStatus } from "../../api/userApi";

const roleColors = {
  attendee:  "bg-indigo-100 text-indigo-700",
  organizer: "bg-violet-100 text-violet-700",
  admin:     "bg-slate-100 text-slate-700",
};

const getDisplayRole = (role) => {
  if (role === "User") return "attendee";
  if (role === "Organizer") return "organizer";
  return role?.toLowerCase() || "";
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = () => {
    setLoading(true);
    getUsers()
      .then((res) => {
        if (res.success && res.users) {
          setUsers(res.users);
        } else if (res.users) {
          setUsers(res.users);
        }
      })
      .catch((err) => {
        console.error("Error loading users:", err);
        setError("Failed to fetch users from database.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    setActionLoading(true);
    setError("");
    try {
      const res = await updateUserStatus(userId, newStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
      } else {
        setError(res.message || "Failed to update user status.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "An error occurred while updating status.");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    const displayRole = getDisplayRole(u.role);
    const matchSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u._id || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || displayRole === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <>
      <PublicNavbar />

      <main className="container-page py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Manage Users</h1>
            <p className="mt-1 text-slate-500">
              View and manage all registered attendees and event organizers.
            </p>
          </div>
          <Link to="/admin" className="text-xs font-bold text-indigo-600 hover:underline">
            ← Back to Admin 
          </Link>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200 mb-6 font-semibold animate-[fadeIn_0.2s_ease]">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Users",    value: users.length,                                        color: "bg-indigo-50 text-indigo-700" },
            { label: "Active",         value: users.filter((u) => u.status === "Active").length,    color: "bg-green-50 text-green-700"   },
            { label: "Suspended",      value: users.filter((u) => u.status === "Suspended").length, color: "bg-red-50 text-red-700"       },
          ].map(({ label, value, color }) => (
            <div key={label} className={`glass-card p-5 ${color}`}>
              <p className="text-3xl font-black">{value}</p>
              <p className="mt-1 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="form-input pl-11"
              placeholder="Search by name, email or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["All", "attendee", "organizer"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                  roleFilter === r
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                }`}
              >
                {r === "attendee" ? "Attendee" : r === "organizer" ? "Organizer" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="text-center py-20 bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="text-slate-400 text-sm mt-3">Loading database users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-500">
                    <th className="p-4 font-semibold">User ID</th>
                    <th className="p-4 font-semibold">Name</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Phone</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Joined</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="p-4 font-mono text-xs font-bold text-slate-400">{u._id}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                            {u.name ? u.name[0] : "U"}
                          </div>
                          <span className="font-semibold">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4 text-slate-600">{u.mobileNumber || "—"}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${roleColors[getDisplayRole(u.role)] || "bg-slate-100 text-slate-600"}`}>
                          {getDisplayRole(u.role)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            u.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{u.createdDate ? u.createdDate.split(" ")[0] : "—"}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(u._id, "Active")}
                            disabled={actionLoading || u.status === "Active"}
                            className={`rounded-lg p-2 text-green-600 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Activate"
                          >
                            <FiUserCheck className="text-base" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(u._id, "Suspended")}
                            disabled={actionLoading || u.status === "Suspended"}
                            className={`rounded-lg p-2 text-red-500 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed`}
                            title="Suspend"
                          >
                            <FiUserX className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
