
"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin/coaches");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #000 0%, #1a0000 40%, #000 100%)",
        fontFamily: "'Inter', sans-serif"
      }}>
      
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "linear-gradient(rgba(128,0,0,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(128,0,0,0.1) 1px,transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <a href="/" className="text-2xl font-black tracking-widest uppercase inline-block mb-8">
            JJ<span style={{ color: "#800000" }}>Studio</span>
          </a>
          <div className="w-12 h-0.5 mx-auto mb-8" style={{ backgroundColor: "#800000" }} />
          <h1 className="text-4xl font-black uppercase tracking-wide leading-none mb-3" style={{ letterSpacing: "-0.02em" }}>
            Admin Access
          </h1>
          <p className="text-xs tracking-widest uppercase text-white/40">Manage coaches and sessions</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-white/60 mb-3">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="email"
                placeholder="admin@jjstudio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-red-900 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-white/60 mb-3">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-red-900 transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex gap-3 p-4 bg-white/5 border border-red-900/30">
              <AlertCircle className="text-red-800 flex-shrink-0" size={18} style={{ color: "#800000" }} />
              <p className="text-xs" style={{ color: "rgba(128,0,0,0.8)" }}>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-900 hover:bg-red-800 disabled:opacity-50 text-white font-bold tracking-widest uppercase text-xs transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            style={{ backgroundColor: loading ? "rgba(128,0,0,0.6)" : "#800000" }}
          >
            {loading && <Loader size={16} className="animate-spin" />}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30 tracking-widest">ADMIN ONLY</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Links */}
        <div className="text-center space-y-3">
          <p className="text-xs text-white/25">
            <a href="/" className="text-red-800/50 hover:text-red-800/70 transition-colors" style={{ color: "rgba(128,0,0,0.5)" }}>
              back to home
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/20 tracking-widest uppercase">
            JJStudio Management Portal
          </p>
        </div>
      </div>
    </main>
  );
}
