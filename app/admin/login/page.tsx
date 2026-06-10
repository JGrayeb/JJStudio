"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/admin/coaches");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input className="border border-gray-600 bg-black text-white p-2 rounded" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border border-gray-600 bg-black text-white p-2 rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-white text-black font-bold p-2 rounded" type="submit">Login</button>
      </form>
    </div>
  );
}
