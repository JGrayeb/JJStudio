
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const FOCUS_OPTIONS = ["Full Body", "Lower Body", "Arms", "Core", "Hell"];

const SCHEDULE: Record<string, number[]> = {
  Monday:    [7,8,9,10,11,12,13,16,17,18,19,20],
  Tuesday:   [7,8,9,10,11,12,13,16,17,18,19,20],
  Wednesday: [7,8,9,10,11,12,13,16,17,18,19,20],
  Thursday:  [7,8,9,10,11,12,13,16,17,18,19,20],
  Friday:    [7,8,9,10,11,12,13,16,17,18,19,20],
  Saturday:  [9,10,11,12,13],
  Sunday:    [11,12,13],
};

function getDayName(dateStr: string) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days[new Date(dateStr + "T12:00:00").getDay()];
}

function formatHour(h: number) {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h;
  return `${display}:00 ${suffix}`;
}

type ClassRow = {
  id: string;
  name: string;
  focus: string;
  date: string;
  hour: number;
  capacity: number;
  spots_remaining: number;
};

export default function AdminClassesPage() {
  const supabase = createClient();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    focus: "Full Body",
    date: "",
    hour: 7,
  });

  const availableHours = form.date
    ? SCHEDULE[getDayName(form.date)] ?? []
    : [];

  async function fetchClasses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("date", { ascending: true })
      .order("hour", { ascending: true });
    if (!error && data) setClasses(data);
    setLoading(false);
  }

  useEffect(() => { fetchClasses(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.date) return setError("Select a date.");
    if (!availableHours.includes(form.hour)) return setError("Invalid hour for this day.");

    setSubmitting(true);
    const { error } = await supabase.from("classes").insert({
      name: form.name,
      focus: form.focus,
      date: form.date,
      hour: form.hour,
      capacity: 7,
      spots_remaining: 7,
    });

    if (error) setError(error.message);
    else {
      setShowForm(false);
      setForm({ name: "", focus: "Full Body", date: "", hour: 7 });
      fetchClasses();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("classes").delete().eq("id", id);
    setDeleteId(null);
    fetchClasses();
  }

  const focusColors: Record<string, string> = {
    "Full Body":  "bg-blue-100 text-blue-800",
    "Lower Body": "bg-green-100 text-green-800",
    "Arms":       "bg-yellow-100 text-yellow-800",
    "Core":       "bg-orange-100 text-orange-800",
    "Hell":       "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Classes</h1>
            <p className="text-gray-400 mt-1">Manage class slots</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setError(""); }}
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            + New Class
          </button>
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-6">New Class</h2>
              <form onSubmit={handleCreate} className="space-y-4">

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Class Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Morning Burn"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Focus</label>
                  <select
                    value={form.focus}
                    onChange={e => setForm({ ...form, focus: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white"
                  >
                    {FOCUS_OPTIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={e => {
                      const newDate = e.target.value;
                      const hours = SCHEDULE[getDayName(newDate)] ?? [];
                      setForm({ ...form, date: newDate, hour: hours[0] ?? 7 });
                    }}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white"
                  />
                  {form.date && (
                    <p className="text-xs text-gray-500 mt-1">{getDayName(form.date)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hour</label>
                  <select
                    value={form.hour}
                    onChange={e => setForm({ ...form, hour: Number(e.target.value) })}
                    disabled={availableHours.length === 0}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white disabled:opacity-40"
                  >
                    {availableHours.map(h => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                  {availableHours.length === 0 && (
                    <p className="text-xs text-red-400 mt-1">Pick a date first</p>
                  )}
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Class"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm text-center">
              <h2 className="text-xl font-bold mb-2">Delete Class?</h2>
              <p className="text-gray-400 mb-6">This will also remove all bookings for this slot.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-red-600 py-2 rounded-lg font-semibold hover:bg-red-500 transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Classes Table */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No classes yet. Create the first one.
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-left">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Focus</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Day</th>
                  <th className="px-6 py-4 font-medium">Hour</th>
                  <th className="px-6 py-4 font-medium">Spots</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, i) => (
                  <tr
                    key={cls.id}
                    className={`border-b border-gray-800 hover:bg-gray-800/50 transition ${i === classes.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-6 py-4 font-semibold">{cls.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${focusColors[cls.focus] ?? "bg-gray-700 text-gray-200"}`}>
                        {cls.focus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{cls.date}</td>
                    <td className="px-6 py-4 text-gray-300">{getDayName(cls.date)}</td>
                    <td className="px-6 py-4 text-gray-300">{formatHour(cls.hour)}</td>
                    <td className="px-6 py-4">
                      <span className={cls.spots_remaining === 0 ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>
                        {cls.spots_remaining}/{cls.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setDeleteId(cls.id)}
                        className="text-gray-500 hover:text-red-400 transition text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
