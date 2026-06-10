
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Coach = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export default function CoachesPage() {
  const supabase = createClient();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchCoaches() {
    const { data } = await supabase.from("coaches").select("*").order("created_at", { ascending: false });
    if (data) setCoaches(data);
  }

  useEffect(() => {
    fetchCoaches();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.from("coaches").insert({ name, email });
    if (error) {
      setError(error.message);
    } else {
      setName("");
      setEmail("");
      fetchCoaches();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("coaches").delete().eq("id", id);
    fetchCoaches();
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Coaches</h1>

      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border rounded px-3 py-2 flex-1"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Coach"}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {coaches.map((coach) => (
            <tr key={coach.id} className="border-b">
              <td className="py-2">{coach.name}</td>
              <td className="py-2">{coach.email}</td>
              <td className="py-2 text-right">
                <button
                  onClick={() => handleDelete(coach.id)}
                  className="text-red-500 hover:underline text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {coaches.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-400">
                No coaches yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
