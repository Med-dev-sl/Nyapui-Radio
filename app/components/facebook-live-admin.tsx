"use client";

import { useEffect, useState, FormEvent } from "react";

type Guest = { id: number; name: string; position: string; institution: string };
type Presenter = { id: number; name: string };
type Comment = { id: number; commenter_name: string; comment_text: string; created_at: string };

type FacebookLive = {
  id: number;
  facebook_url: string;
  topic: string;
  is_active: number;
  created_at: string;
  like_count: number;
  comment_count: number;
  guests: Guest[];
  presenters: Presenter[];
};

type FormGuest = { name: string; position: string; institution: string };
type FormPresenter = { name: string };

export default function FacebookLiveAdmin() {
  const [lives, setLives] = useState<FacebookLive[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FacebookLive | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FacebookLive | null>(null);
  const [preview, setPreview] = useState<FacebookLive | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    facebook_url: "",
    topic: "",
    guests: [] as FormGuest[],
    presenters: [] as FormPresenter[],
  });

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [fbReady, setFbReady] = useState(false);

  // Guest search state per row
  const [guestSearches, setGuestSearches] = useState<string[]>([]);
  const [guestResults, setGuestResults] = useState<Guest[][]>([]);
  const [showGuestDropdown, setShowGuestDropdown] = useState<boolean[]>([]);

  // Presenter search state per row
  const [presenterSearches, setPresenterSearches] = useState<string[]>([]);
  const [presenterResults, setPresenterResults] = useState<Presenter[][]>([]);
  const [showPresenterDropdown, setShowPresenterDropdown] = useState<boolean[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || (window as any).FB) {
      if ((window as any).FB) setFbReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
    script.onload = () => setFbReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (preview && fbReady && (window as any).FB) {
      setTimeout(() => (window as any).FB.XFBML.parse(), 600);
    }
  }, [preview, fbReady]);

  function show(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchLives() {
    const res = await fetch("/api/facebook-lives");
    const data = await res.json();
    setLives(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchLives(); }, []);

  // Guest search debounce per index
  useEffect(() => {
    const indices = guestSearches.map((val, i) => ({ val, i })).filter(({ val }) => val.length > 0);
    if (indices.length === 0) { setGuestResults([]); return; }
    const timer = setTimeout(async () => {
      const newResults: Guest[][] = [];
      for (const { val } of indices) {
        const res = await fetch(`/api/guests?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        newResults.push(Array.isArray(data) ? data : []);
      }
      setGuestResults(newResults);
    }, 300);
    return () => clearTimeout(timer);
  }, [guestSearches]);

  // Presenter search debounce per index
  useEffect(() => {
    const indices = presenterSearches.map((val, i) => ({ val, i })).filter(({ val }) => val.length > 0);
    if (indices.length === 0) { setPresenterResults([]); return; }
    const timer = setTimeout(async () => {
      const newResults: Presenter[][] = [];
      for (const { val } of indices) {
        const res = await fetch(`/api/presenters?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        newResults.push(Array.isArray(data) ? data : []);
      }
      setPresenterResults(newResults);
    }, 300);
    return () => clearTimeout(timer);
  }, [presenterSearches]);

  function selectGuest(gi: number, g: Guest) {
    const updated = [...form.guests];
    updated[gi] = { name: g.name, position: g.position, institution: g.institution };
    setForm({ ...form, guests: updated });
    const sg = [...guestSearches]; sg[gi] = g.name; setGuestSearches(sg);
    const sd = [...showGuestDropdown]; sd[gi] = false; setShowGuestDropdown(sd);
  }

  function selectPresenter(pi: number, p: Presenter) {
    const updated = [...form.presenters];
    updated[pi] = { name: p.name };
    setForm({ ...form, presenters: updated });
    const sg = [...presenterSearches]; sg[pi] = p.name; setPresenterSearches(sg);
    const sd = [...showPresenterDropdown]; sd[pi] = false; setShowPresenterDropdown(sd);
  }

  function addGuestRow() {
    setForm({ ...form, guests: [...form.guests, { name: "", position: "", institution: "" }] });
    setGuestSearches([...guestSearches, ""]);
    setShowGuestDropdown([...showGuestDropdown, false]);
  }

  function removeGuestRow(i: number) {
    const g = [...form.guests]; g.splice(i, 1); setForm({ ...form, guests: g });
    const sg = [...guestSearches]; sg.splice(i, 1); setGuestSearches(sg);
    const sd = [...showGuestDropdown]; sd.splice(i, 1); setShowGuestDropdown(sd);
  }

  function addPresenterRow() {
    setForm({ ...form, presenters: [...form.presenters, { name: "" }] });
    setPresenterSearches([...presenterSearches, ""]);
    setShowPresenterDropdown([...showPresenterDropdown, false]);
  }

  function removePresenterRow(i: number) {
    const p = [...form.presenters]; p.splice(i, 1); setForm({ ...form, presenters: p });
    const sg = [...presenterSearches]; sg.splice(i, 1); setPresenterSearches(sg);
    const sd = [...showPresenterDropdown]; sd.splice(i, 1); setShowPresenterDropdown(sd);
  }

  function openCreate() {
    setEditing(null);
    setForm({ facebook_url: "", topic: "", guests: [{ name: "", position: "", institution: "" }], presenters: [{ name: "" }] });
    setGuestSearches([""]);
    setShowGuestDropdown([false]);
    setPresenterSearches([""]);
    setShowPresenterDropdown([false]);
    setShowModal(true);
  }

  function openEdit(live: FacebookLive) {
    setEditing(live);
    const guests = live.guests.length > 0 ? live.guests.map(g => ({ name: g.name, position: g.position, institution: g.institution })) : [{ name: "", position: "", institution: "" }];
    const presenters = live.presenters.length > 0 ? live.presenters.map(p => ({ name: p.name })) : [{ name: "" }];
    setForm({ facebook_url: live.facebook_url, topic: live.topic || "", guests, presenters });
    setGuestSearches(guests.map(g => g.name));
    setShowGuestDropdown(guests.map(() => false));
    setPresenterSearches(presenters.map(p => p.name));
    setShowPresenterDropdown(presenters.map(() => false));
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.facebook_url) { show("Facebook URL is required", false); return; }

    const body = {
      facebook_url: form.facebook_url,
      topic: form.topic,
      guests: form.guests.filter(g => g.name.trim()),
      presenters: form.presenters.filter(p => p.name.trim()),
    };

    const url = editing ? `/api/facebook-lives/${editing.id}` : "/api/facebook-lives";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const data = await res.json(); show(data.error || "Request failed", false); return; }

    show(editing ? "Live updated" : "Live created", true);
    setShowModal(false);
    fetchLives();
  }

  async function toggleActive(live: FacebookLive) {
    const res = await fetch(`/api/facebook-lives/${live.id}/toggle`, { method: "PATCH" });
    if (!res.ok) return;
    show(live.is_active ? "Live deactivated" : "Live activated", true);
    fetchLives();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/facebook-lives/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) { const data = await res.json(); show(data.error, false); return; }
    show("Live deleted", true);
    setDeleteTarget(null);
    fetchLives();
  }

  const filtered = lives.filter(l =>
    l.facebook_url.toLowerCase().includes(search.toLowerCase()) ||
    l.topic.toLowerCase().includes(search.toLowerCase()) ||
    l.guests.some(g => g.name.toLowerCase().includes(search.toLowerCase())) ||
    l.presenters.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  function guestSummary(live: FacebookLive) {
    if (live.guests.length === 0) return "—";
    const first = live.guests[0];
    let label = first.name;
    if (first.position) label += ` (${first.position})`;
    if (live.guests.length > 1) label += ` +${live.guests.length - 1} more`;
    return label;
  }

  function presenterSummary(live: FacebookLive) {
    if (live.presenters.length === 0) return "—";
    const names = live.presenters.map(p => p.name);
    return names.length <= 2 ? names.join(", ") : `${names[0]}, ${names[1]} +${names.length - 2} more`;
  }

  return (
    <div className="p-6 animate-fade-slide-in">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white animate-modal-in ${toast.ok ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Facebook Live</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage live streams, guests, presenters, and engagement</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Live
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="text" placeholder="Search lives..." value={search} onChange={e => setSearch(e.target.value)}
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
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Facebook URL</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Topic</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Guests</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Presenters</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Likes</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Comments</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((live, i) => (
                <tr key={live.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors duration-150 animate-fade-slide-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td className="px-5 py-4 text-sm text-zinc-400">{live.id}</td>
                  <td className="px-5 py-4 max-w-[140px]">
                    <a href={live.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1a4b8c] hover:underline truncate block">
                      {live.facebook_url.length > 30 ? live.facebook_url.slice(0, 30) + "..." : live.facebook_url}
                    </a>
                  </td>
                  <td className="px-5 py-4 max-w-[160px]"><span className="text-sm text-zinc-700 line-clamp-2">{live.topic || "—"}</span></td>
                  <td className="px-5 py-4 text-sm text-zinc-700">{guestSummary(live)}</td>
                  <td className="px-5 py-4 text-sm text-zinc-700">{presenterSummary(live)}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-rose-600 font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                      {live.like_count}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-600">{live.comment_count}</td>
                  <td className="px-5 py-4">
                    {live.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"><span className="size-1.5 rounded-full bg-green-500" /> Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-500"><span className="size-1.5 rounded-full bg-zinc-400" /> Inactive</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setPreview(live)} className="rounded-lg p-2 text-zinc-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200" title="Preview">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </button>
                      <button onClick={() => toggleActive(live)}
                        className={`rounded-lg p-2 transition-all duration-200 ${live.is_active ? "text-zinc-400 hover:bg-zinc-100" : "text-green-500 hover:bg-green-50"}`}
                        title={live.is_active ? "Deactivate" : "Activate"}>
                        {live.is_active ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        )}
                      </button>
                      <button onClick={() => openEdit(live)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-[#1a4b8c] transition-all duration-200" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => setDeleteTarget(live)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-zinc-400">No lives found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="animate-modal-in bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-zinc-800 mb-6">{editing ? "Edit Live" : "New Live"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Facebook Live URL</label>
                <input type="url" required value={form.facebook_url} onChange={e => setForm({ ...form, facebook_url: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all"
                  placeholder="https://www.facebook.com/watch/live/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Topic of Discussion</label>
                <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all"
                  placeholder="e.g. Climate Change and Its Impact on Agriculture" />
              </div>

              {/* Guests Section */}
              <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-zinc-700">Guests</label>
                  <button type="button" onClick={addGuestRow}
                    className="text-xs font-semibold text-[#1a4b8c] hover:text-blue-700 transition-colors flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Guest
                  </button>
                </div>
                {form.guests.map((g, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-start">
                    <div className="flex-1 relative">
                      <input type="text" placeholder="Name" value={guestSearches[i] || ""}
                        onChange={e => {
                          const sg = [...guestSearches]; sg[i] = e.target.value; setGuestSearches(sg);
                          setShowGuestDropdown(sg.map((_, j) => j === i));
                          const updated = [...form.guests]; updated[i] = { ...updated[i], name: e.target.value }; setForm({ ...form, guests: updated });
                        }}
                        onFocus={() => { const sd = [...showGuestDropdown]; sd[i] = true; setShowGuestDropdown(sd); }}
                        onBlur={() => setTimeout(() => { const sd = [...showGuestDropdown]; sd[i] = false; setShowGuestDropdown(sd); }, 200)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all"
                      />
                      {showGuestDropdown[i] && guestResults[i]?.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-xl max-h-36 overflow-y-auto animate-fade-slide-in">
                          {guestResults[i].map(gr => (
                            <button type="button" key={gr.id} onMouseDown={() => selectGuest(i, gr)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-[#1a4b8c] transition-colors">
                              <span className="font-medium">{gr.name}</span>
                              {gr.position && <span className="text-zinc-400 ml-2">{gr.position}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="text" placeholder="Position" value={g.position} onChange={e => { const u = [...form.guests]; u[i] = { ...u[i], position: e.target.value }; setForm({ ...form, guests: u }); }}
                      className="w-36 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all" />
                    <input type="text" placeholder="Institution" value={g.institution} onChange={e => { const u = [...form.guests]; u[i] = { ...u[i], institution: e.target.value }; setForm({ ...form, guests: u }); }}
                      className="w-36 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all" />
                    {form.guests.length > 1 && (
                      <button type="button" onClick={() => removeGuestRow(i)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Presenters Section */}
              <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-zinc-700">Presenters</label>
                  <button type="button" onClick={addPresenterRow}
                    className="text-xs font-semibold text-[#1a4b8c] hover:text-blue-700 transition-colors flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Presenter
                  </button>
                </div>
                {form.presenters.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-start">
                    <div className="flex-1 relative">
                      <input type="text" placeholder="Presenter name" value={presenterSearches[i] || ""}
                        onChange={e => {
                          const sg = [...presenterSearches]; sg[i] = e.target.value; setPresenterSearches(sg);
                          setShowPresenterDropdown(sg.map((_, j) => j === i));
                          const updated = [...form.presenters]; updated[i] = { name: e.target.value }; setForm({ ...form, presenters: updated });
                        }}
                        onFocus={() => { const sd = [...showPresenterDropdown]; sd[i] = true; setShowPresenterDropdown(sd); }}
                        onBlur={() => setTimeout(() => { const sd = [...showPresenterDropdown]; sd[i] = false; setShowPresenterDropdown(sd); }, 200)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all"
                      />
                      {showPresenterDropdown[i] && presenterResults[i]?.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-xl max-h-36 overflow-y-auto animate-fade-slide-in">
                          {presenterResults[i].map(pr => (
                            <button type="button" key={pr.id} onMouseDown={() => selectPresenter(i, pr)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-[#1a4b8c] transition-colors">
                              {pr.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {form.presenters.length > 1 && (
                      <button type="button" onClick={() => removePresenterRow(i)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">Cancel</button>
                <button type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200">
                  {editing ? "Update" : "Create"}</button>
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
            <p className="text-center text-lg font-semibold text-zinc-800 mb-2">Delete Live</p>
            <p className="text-center text-sm text-zinc-500 mb-6">Are you sure you want to delete this live stream?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">Cancel</button>
              <button onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="animate-modal-in bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-bold text-zinc-800">Live Preview</h2>
              <button onClick={() => setPreview(null)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 mb-6 min-h-[280px] flex items-center justify-center">
                {fbReady ? (
                  <div className="fb-video w-full" data-href={preview.facebook_url} data-width="734" data-show-text="false" data-lazy="true" />
                ) : (
                  <div className="text-center p-8">
                    <div className="size-8 rounded-full border-4 border-[#1a4b8c]/20 border-t-[#1a4b8c] animate-spin mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">Loading video player...</p>
                  </div>
                )}
              </div>

              <div className="mb-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <div className="mb-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase">Topic</span>
                  <p className="text-sm font-medium text-zinc-800 mt-0.5">{preview.topic || "—"}</p>
                </div>

                <div className="mb-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase">Guests ({preview.guests.length})</span>
                  {preview.guests.length === 0 ? (
                    <p className="text-sm text-zinc-500 mt-0.5">None</p>
                  ) : (
                    <div className="mt-1 space-y-1.5">
                      {preview.guests.map((g, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="size-1.5 rounded-full bg-[#1a4b8c]" />
                          <span className="font-medium text-zinc-800">{g.name}</span>
                          {g.position && <span className="text-zinc-500">— {g.position}</span>}
                          {g.institution && <span className="text-zinc-400">({g.institution})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase">Presenters ({preview.presenters.length})</span>
                  {preview.presenters.length === 0 ? (
                    <p className="text-sm text-zinc-500 mt-0.5">None</p>
                  ) : (
                    <div className="mt-1 space-y-1.5">
                      {preview.presenters.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          <span className="font-medium text-zinc-800">{p.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 text-lg font-bold text-rose-600">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                  {preview.like_count}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-zinc-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  {preview.comment_count} comments
                </span>
              </div>
              <a href={preview.facebook_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#1877F2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#166fe5] transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Open on Facebook
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
