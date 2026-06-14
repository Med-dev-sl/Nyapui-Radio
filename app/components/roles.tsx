"use client";

import { useEffect, useState, FormEvent } from "react";

type Role = {
  id: number;
  name: string;
  description: string | null;
};

export default function RolesUI() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");

  async function fetchRoles() {
    const res = await fetch("/api/roles");
    const data = await res.json();
    setRoles(data);
    setLoading(false);
  }

  useEffect(() => { fetchRoles(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "" });
    setShowModal(true);
  }

  function openEdit(role: Role) {
    setEditing(role);
    setForm({ name: role.name, description: role.description || "" });
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/roles/${editing.id}` : "/api/roles";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }

    setShowModal(false);
    fetchRoles();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/roles/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchRoles();
  }

  const filtered = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 animate-fade-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Roles</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage system user roles</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Role
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-8 rounded-full border-4 border-[#1a4b8c]/20 border-t-[#1a4b8c] animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">#</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Description</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((role, i) => (
                <tr
                  key={role.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors duration-150 animate-fade-slide-in"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <td className="px-5 py-4 text-sm text-zinc-400">{role.id}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#1a4b8c]/10 px-3 py-1 text-sm font-medium text-[#1a4b8c]">
                      {role.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-600">{role.description || "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(role)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-[#1a4b8c] transition-all duration-200"
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(role)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-zinc-400">
                    No roles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="animate-modal-in bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-zinc-800 mb-6">
              {editing ? "Edit Role" : "New Role"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all"
                  placeholder="e.g. Editor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="animate-shake bg-white rounded-2xl px-10 py-8 shadow-2xl max-w-sm w-full mx-4">
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-center text-lg font-semibold text-zinc-800 mb-2">Delete Role</p>
            <p className="text-center text-sm text-zinc-500 mb-6">
              Are you sure you want to delete <strong className="text-zinc-700">{deleteTarget.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
