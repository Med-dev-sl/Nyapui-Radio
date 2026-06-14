"use client";

import { useEffect, useState, FormEvent } from "react";

type ScheduleGuest = { id: number; name: string; position: string; institution: string };
type SchedulePresenter = { id: number; name: string };

type Schedule = {
  id: number;
  photo_url: string;
  scheduled_at: string;
  topic: string;
  is_active: number;
  created_at: string;
  remind_count: number;
  guests: ScheduleGuest[];
  presenters: SchedulePresenter[];
};

type FormGuest = { name: string; position: string; institution: string };
type FormPresenter = { name: string };

export default function ProgramSchedulesUI() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    photo_url: "",
    schedule_date: "",
    schedule_time: "",
    topic: "",
    guests: [] as FormGuest[],
    presenters: [] as FormPresenter[],
  });

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Guest search
  const [guestSearches, setGuestSearches] = useState<string[]>([]);
  const [guestResults, setGuestResults] = useState<ScheduleGuest[][]>([]);
  const [showGuestDropdown, setShowGuestDropdown] = useState<boolean[]>([]);

  // Presenter search
  const [presenterSearches, setPresenterSearches] = useState<string[]>([]);
  const [presenterResults, setPresenterResults] = useState<SchedulePresenter[][]>([]);
  const [showPresenterDropdown, setShowPresenterDropdown] = useState<boolean[]>([]);

  function show(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchSchedules() {
    const res = await fetch("/api/schedules");
    const data = await res.json();
    setSchedules(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { fetchSchedules(); }, []);

  // Guest search debounce
  useEffect(() => {
    const indices = guestSearches.map((v, i) => ({ v, i })).filter(({ v }) => v.length > 0);
    if (indices.length === 0) { setGuestResults([]); return; }
    const timer = setTimeout(async () => {
      const r: ScheduleGuest[][] = [];
      for (const { v } of indices) {
        const res = await fetch(`/api/guests?q=${encodeURIComponent(v)}`);
        r.push(Array.isArray(await res.json()) ? await res.json() : []);
      }
      setGuestResults(r);
    }, 300);
    return () => clearTimeout(timer);
  }, [guestSearches]);

  // Presenter search debounce
  useEffect(() => {
    const indices = presenterSearches.map((v, i) => ({ v, i })).filter(({ v }) => v.length > 0);
    if (indices.length === 0) { setPresenterResults([]); return; }
    const timer = setTimeout(async () => {
      const r: SchedulePresenter[][] = [];
      for (const { v } of indices) {
        const res = await fetch(`/api/presenters?q=${encodeURIComponent(v)}`);
        r.push(Array.isArray(await res.json()) ? await res.json() : []);
      }
      setPresenterResults(r);
    }, 300);
    return () => clearTimeout(timer);
  }, [presenterSearches]);

  function selectGuest(gi: number, g: ScheduleGuest) {
    const u = [...form.guests]; u[gi] = { name: g.name, position: g.position, institution: g.institution };
    setForm({ ...form, guests: u });
    const sg = [...guestSearches]; sg[gi] = g.name; setGuestSearches(sg);
    const sd = [...showGuestDropdown]; sd[gi] = false; setShowGuestDropdown(sd);
  }

  function selectPresenter(pi: number, p: SchedulePresenter) {
    const u = [...form.presenters]; u[pi] = { name: p.name };
    setForm({ ...form, presenters: u });
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

  function formatDateTime(d: string) {
    if (!d) return { date: "", time: "" };
    const dt = new Date(d);
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
      time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
    };
  }

  function openCreate() {
    setEditing(null);
    setForm({ photo_url: "", schedule_date: "", schedule_time: "", topic: "", guests: [{ name: "", position: "", institution: "" }], presenters: [{ name: "" }] });
    setGuestSearches([""]); setShowGuestDropdown([false]);
    setPresenterSearches([""]); setShowPresenterDropdown([false]);
    setLocalPreview(null);
    setShowModal(true);
  }

  function openEdit(s: Schedule) {
    setEditing(s);
    const { date, time } = formatDateTime(s.scheduled_at);
    const guests = s.guests.length > 0 ? s.guests.map(g => ({ name: g.name, position: g.position, institution: g.institution })) : [{ name: "", position: "", institution: "" }];
    const presenters = s.presenters.length > 0 ? s.presenters.map(p => ({ name: p.name })) : [{ name: "" }];
    setForm({ photo_url: s.photo_url, schedule_date: date, schedule_time: time, topic: s.topic || "", guests, presenters });
    setGuestSearches(guests.map(g => g.name)); setShowGuestDropdown(guests.map(() => false));
    setPresenterSearches(presenters.map(p => p.name)); setShowPresenterDropdown(presenters.map(() => false));
    setLocalPreview(null);
    setShowModal(true);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload/photo", { method: "POST", body: fd });
    if (!res.ok) { show("Photo upload failed", false); setUploading(false); return; }
    const data = await res.json();
    setForm({ ...form, photo_url: data.url });
    setUploading(false);
    show("Photo uploaded", true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.schedule_date || !form.schedule_time) { show("Date and time are required", false); return; }

    const scheduled_at = `${form.schedule_date} ${form.schedule_time}:00`;
    const body = {
      photo_url: form.photo_url,
      scheduled_at,
      topic: form.topic,
      guests: form.guests.filter(g => g.name.trim()),
      presenters: form.presenters.filter(p => p.name.trim()),
    };

    const url = editing ? `/api/schedules/${editing.id}` : "/api/schedules";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { const data = await res.json(); show(data.error || "Request failed", false); return; }

    show(editing ? "Schedule updated" : "Schedule created", true);
    setShowModal(false);
    fetchSchedules();
  }

  async function toggleActive(s: Schedule) {
    const res = await fetch(`/api/schedules/${s.id}/toggle`, { method: "PATCH" });
    if (!res.ok) return;
    show(s.is_active ? "Schedule deactivated" : "Schedule activated", true);
    fetchSchedules();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/schedules/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) { const data = await res.json(); show(data.error, false); return; }
    show("Schedule deleted", true);
    setDeleteTarget(null);
    fetchSchedules();
  }

  function formatDisplayDate(d: string) {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const filtered = schedules.filter(s =>
    s.topic?.toLowerCase().includes(search.toLowerCase()) ||
    s.guests.some(g => g.name.toLowerCase().includes(search.toLowerCase())) ||
    s.presenters.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  function guestSummary(s: Schedule) {
    if (s.guests.length === 0) return "—";
    const f = s.guests[0];
    let label = f.name;
    if (f.position) label += ` (${f.position})`;
    if (s.guests.length > 1) label += ` +${s.guests.length - 1} more`;
    return label;
  }

  function presenterSummary(s: Schedule) {
    if (s.presenters.length === 0) return "—";
    const n = s.presenters.map(p => p.name);
    return n.length <= 2 ? n.join(", ") : `${n[0]}, ${n[1]} +${n.length - 2} more`;
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
          <h1 className="text-2xl font-bold text-zinc-800">Program Schedules</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage scheduled programs, guests, presenters, and reminders</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Schedule
        </button>
      </div>

      <div className="relative mb-4 max-w-xs">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input type="text" placeholder="Search schedules..." value={search} onChange={e => setSearch(e.target.value)}
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
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Photo</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Schedule</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Topic</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Guests</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Presenters</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Reminders</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/80 transition-colors duration-150 animate-fade-slide-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td className="px-5 py-4 text-sm text-zinc-400">{s.id}</td>
                  <td className="px-5 py-4">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt="" className="size-10 rounded-lg object-cover border border-zinc-200" />
                    ) : (
                      <span className="size-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-700 whitespace-nowrap">{formatDisplayDate(s.scheduled_at)}</td>
                  <td className="px-5 py-4 max-w-[160px]"><span className="text-sm text-zinc-700 line-clamp-2">{s.topic || "—"}</span></td>
                  <td className="px-5 py-4 text-sm text-zinc-700">{guestSummary(s)}</td>
                  <td className="px-5 py-4 text-sm text-zinc-700">{presenterSummary(s)}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      {s.remind_count}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {s.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"><span className="size-1.5 rounded-full bg-green-500" /> Active</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-500"><span className="size-1.5 rounded-full bg-zinc-400" /> Inactive</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActive(s)}
                        className={`rounded-lg p-2 transition-all duration-200 ${s.is_active ? "text-zinc-400 hover:bg-zinc-100" : "text-green-500 hover:bg-green-50"}`}
                        title={s.is_active ? "Deactivate" : "Activate"}>
                        {s.is_active ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        )}
                      </button>
                      <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-[#1a4b8c] transition-all duration-200" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => setDeleteTarget(s)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} className="px-5 py-12 text-center text-sm text-zinc-400">No schedules found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="animate-modal-in bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-zinc-800 mb-6">{editing ? "Edit Schedule" : "New Schedule"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Photo</label>
                <div className="flex flex-col gap-3">
                  {(localPreview || form.photo_url) ? (
                    <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 group">
                      <img src={localPreview || form.photo_url} alt="Preview"
                        className="w-full h-48 object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="size-8 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full max-w-sm h-48 rounded-xl bg-zinc-100 border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:bg-zinc-50 transition-colors">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      <span className="text-sm">No photo selected</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer rounded-lg bg-gradient-to-r from-[#1a4b8c] to-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all">
                      {uploading ? "Uploading..." : localPreview ? "Change Photo" : "Choose Photo"}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {(localPreview || form.photo_url) && (
                      <button type="button" onClick={() => { setForm({ ...form, photo_url: "" }); setLocalPreview(null); }}
                        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors">Remove</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
                  <input type="date" required value={form.schedule_date} onChange={e => setForm({ ...form, schedule_date: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Time</label>
                  <input type="time" required value={form.schedule_time} onChange={e => setForm({ ...form, schedule_time: e.target.value })}
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all" />
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Topic of Discussion</label>
                <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all"
                  placeholder="e.g. Climate Change and Its Impact" />
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
                          const u = [...form.guests]; u[i] = { ...u[i], name: e.target.value }; setForm({ ...form, guests: u });
                        }}
                        onFocus={() => { const sd = [...showGuestDropdown]; sd[i] = true; setShowGuestDropdown(sd); }}
                        onBlur={() => setTimeout(() => { const sd = [...showGuestDropdown]; sd[i] = false; setShowGuestDropdown(sd); }, 200)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all" />
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
                      className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all" />
                    <input type="text" placeholder="Institution" value={g.institution} onChange={e => { const u = [...form.guests]; u[i] = { ...u[i], institution: e.target.value }; setForm({ ...form, guests: u }); }}
                      className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all" />
                    {form.guests.length > 1 && (
                      <button type="button" onClick={() => removeGuestRow(i)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
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
                          const u = [...form.presenters]; u[i] = { name: e.target.value }; setForm({ ...form, presenters: u });
                        }}
                        onFocus={() => { const sd = [...showPresenterDropdown]; sd[i] = true; setShowPresenterDropdown(sd); }}
                        onBlur={() => setTimeout(() => { const sd = [...showPresenterDropdown]; sd[i] = false; setShowPresenterDropdown(sd); }, 200)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#1a4b8c] focus:ring-2 focus:ring-[#1a4b8c]/10 transition-all" />
                      {showPresenterDropdown[i] && presenterResults[i]?.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-xl max-h-36 overflow-y-auto animate-fade-slide-in">
                          {presenterResults[i].map(pr => (
                            <button type="button" key={pr.id} onMouseDown={() => selectPresenter(i, pr)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-[#1a4b8c] transition-colors">{pr.name}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    {form.presenters.length > 1 && (
                      <button type="button" onClick={() => removePresenterRow(i)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
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
            <p className="text-center text-lg font-semibold text-zinc-800 mb-2">Delete Schedule</p>
            <p className="text-center text-sm text-zinc-500 mb-6">Are you sure you want to delete this schedule?</p>
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
