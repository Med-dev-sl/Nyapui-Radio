"use client";

import { useEffect, useState, FormEvent } from "react";

type Podcast = {
  id: number;
  title: string;
  description: string | null;
  is_active: number;
  created_at: string;
  like_count: number;
  comment_count: number;
};

type Comment = { id: number; commenter_name: string; comment_text: string; created_at: string };

export default function PodcastAdmin() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Podcast | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Podcast | null>(null);
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const [form, setForm] = useState({ audio_data: "", title: "", description: "" });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function show(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchPodcasts() {
    const res = await fetch("/api/podcasts");
    const data = await res.json();
    setPodcasts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchPodcasts(); }, []);

  async function fetchComments(podcastId: number) {
    const res = await fetch(`/api/podcasts/${podcastId}/comments`);
    const data = await res.json();
    setComments(Array.isArray(data) ? data : []);
  }

  function openCreate() {
    setEditing(null);
    setForm({ audio_data: "", title: "", description: "" });
    setAudioFile(null);
    setAudioPreview(null);
    setShowModal(true);
  }

  function openEdit(podcast: Podcast) {
    setEditing(podcast);
    setForm({ audio_data: "", title: podcast.title, description: podcast.description || "" });
    setAudioFile(null);
    setAudioPreview(null);
    setShowModal(true);
  }

  function handleAudioSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title) { show("Title is required", false); return; }

    const body: Record<string, unknown> = { title: form.title, description: form.description || null };

    if (audioFile) {
      setConverting(true);
      body.audio_data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read audio file"));
        reader.readAsDataURL(audioFile);
      });
      setConverting(false);
    }

    const url = editing ? `/api/podcasts/${editing.id}` : "/api/podcasts";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const data = await res.json(); show(data.error || "Request failed", false); return; }

    show(editing ? "Podcast updated" : "Podcast created", true);
    setShowModal(false);
    fetchPodcasts();
  }

  async function toggleActive(podcast: Podcast) {
    const res = await fetch(`/api/podcasts/${podcast.id}/toggle`, { method: "PATCH" });
    if (!res.ok) return;
    show(podcast.is_active ? "Podcast deactivated" : "Podcast activated", true);
    fetchPodcasts();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/podcasts/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) { const data = await res.json(); show(data.error, false); return; }
    show("Podcast deleted", true);
    setDeleteTarget(null);
    fetchPodcasts();
  }

  async function toggleComments(podcastId: number) {
    if (expandedComments === podcastId) {
      setExpandedComments(null);
      setComments([]);
    } else {
      setExpandedComments(podcastId);
      await fetchComments(podcastId);
    }
  }

  const filtered = podcasts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 animate-fade-slide-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white animate-modal-in ${toast.ok ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Podcasts</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage audio podcasts, likes, and comments</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add Podcast
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="text" placeholder="Search podcasts..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="size-8 rounded-full border-4 border-[#1a4b8c]/20 border-t-[#1a4b8c] animate-spin" /></div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">#</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Title</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Description</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Audio</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Likes</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Comments</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors duration-150 animate-fade-slide-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td className="px-5 py-4 text-sm text-zinc-400">{p.id}</td>
                  <td className="px-5 py-4 text-sm font-medium text-zinc-800">{p.title}</td>
                  <td className="px-5 py-4 max-w-[200px] text-sm text-zinc-500 line-clamp-2">{p.description || "—"}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={async () => {
                        if (playing === p.id) { setPlaying(null); return; }
                        const res = await fetch(`/api/podcasts/${p.id}`);
                        const data = await res.json();
                        if (data.audio_data) {
                          setPlaying(p.id);
                          const audio = new Audio(data.audio_data);
                          audio.onended = () => setPlaying(null);
                          audio.play().catch(() => show("Playback failed", false));
                        } else {
                          show("No audio file", false);
                        }
                      }}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                      title={playing === p.id ? "Stop" : "Play"}
                    >
                      {playing === p.id ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-rose-600 font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                      {p.like_count}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleComments(p.id)} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-[#1a4b8c] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                      {p.comment_count}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    {p.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"><span className="size-1.5 rounded-full bg-green-500" /> Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-500"><span className="size-1.5 rounded-full bg-zinc-400" /> Inactive</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActive(p)}
                        className={`rounded-lg p-2 transition-all duration-200 ${p.is_active ? "text-zinc-400 hover:bg-zinc-100" : "text-green-500 hover:bg-green-50"}`}
                        title={p.is_active ? "Deactivate" : "Activate"}>
                        {p.is_active ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        )}
                      </button>
                      <button onClick={() => openEdit(p)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-[#1a4b8c] transition-all duration-200" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-zinc-400">No podcasts found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Comments Drawer */}
      {expandedComments && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="animate-modal-in bg-white rounded-2xl p-6 shadow-2xl max-w-lg w-full mx-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-800">Comments ({comments.length})</h3>
              <button onClick={() => { setExpandedComments(null); setComments([]); }} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            {comments.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-8">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-zinc-700">{c.commenter_name}</span>
                      <span className="text-xs text-zinc-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-zinc-600">{c.comment_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="animate-modal-in bg-white rounded-2xl p-8 shadow-2xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-zinc-800 mb-6">{editing ? "Edit Podcast" : "Add Podcast"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Audio Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Audio File</label>
                <div className="flex flex-col gap-3">
                  {audioPreview ? (
                    <div className="w-full p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                      <audio src={audioPreview} controls className="w-full h-10" />
                    </div>
                  ) : editing && (
                    <div className="w-full p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-sm text-zinc-400 text-center">
                      Existing audio kept. Select a file to replace it.
                    </div>
                  )}
                  <label className="cursor-pointer self-start rounded-lg bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all">
                    {audioPreview ? "Change Audio" : editing ? "Replace Audio" : "Choose Audio File"}
                    <input type="file" accept="audio/*" onChange={handleAudioSelect} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
                <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all"
                  placeholder="Podcast title" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all resize-none"
                  placeholder="Optional description" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">Cancel</button>
                <button type="submit" disabled={converting}
                  className="flex-1 rounded-lg bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50">
                  {converting ? "Processing..." : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="animate-shake bg-white rounded-2xl px-10 py-8 shadow-2xl max-w-sm w-full mx-4">
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="mx-auto mb-4"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            <p className="text-center text-lg font-semibold text-zinc-800 mb-2">Delete Podcast</p>
            <p className="text-center text-sm text-zinc-500 mb-6">Are you sure you want to delete <strong className="text-zinc-700">{deleteTarget.title}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">Cancel</button>
              <button onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
