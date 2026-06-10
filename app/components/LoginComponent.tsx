'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

export default function LoginComponent() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg,#000 0%,#1a0000 40%,#000 100%)' }}>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black uppercase tracking-widest inline-block mb-4">
            JJ<span style={{ color: '#800000' }}>Studio</span>
          </a>
          <div className="w-12 h-0.5 mx-auto mb-6" style={{ backgroundColor: '#800000' }} />
          <h1 className="text-3xl font-black uppercase">Welcome Back</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/60 uppercase tracking-widest mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-white/30" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-12 pr-3 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-red-900 transition"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-white/60 uppercase tracking-widest">Password</label>
              <a href="#" className="text-xs" style={{ color: '#800000' }}>Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-white/30" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-3 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-red-900 transition"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              />
            </div>
          </div>

          {error && (
            <div className="flex gap-3 p-3 bg-white/5 border border-red-900/30 rounded">
              <AlertCircle className="text-red-800" size={18} />
              <div className="text-xs text-red-800">{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs font-bold uppercase tracking-widest text-white rounded transition flex justify-center items-center gap-2"
            style={{ backgroundColor: '#800000', opacity: loading ? 0.85 : 1 }}
          >
            {loading ? <Loader size={16} className="animate-spin" /> : null}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/40">
          No account yet? <a href="/signup" className="font-bold" style={{ color: '#800000' }}>Sign up</a>
        </div>
      </div>
    </main>
  );
}
