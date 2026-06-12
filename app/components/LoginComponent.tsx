
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

export default function LoginComponent() {
  const { signIn, userProfile, loading: authLoading } = useAuth();
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
      // Wait a brief moment for userProfile to populate
      setTimeout(() => {
        redirectByRole();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = () => {
    const role = userProfile?.role;
    
    if (role === 'admin') {
      router.push('/dashboard/admin');
    } else if (role === 'trainer') {
      router.push('/dashboard/trainer');
    } else if (role === 'client') {
      router.push('/dashboard/client');
    } else {
      // Fallback if role is undefined
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black uppercase tracking-widest inline-block mb-4">
            JJ<span style={{ color: '#800000' }}>Studio</span>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-white/30" size={18} />
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com"
                className="w-full pl-12 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-white/30" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                className="w-full pl-12 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" 
              />
            </div>
            <div className="mt-2 text-right">
              <a href="/forgot-password" className="text-xs" style={{ color: '#800000' }}>Forgot?</a>
            </div>
          </div>

          {error && (
            <div className="flex gap-3 p-3 bg-white/5 border border-red-900/30 rounded">
              <AlertCircle size={18} className="text-red-800" />
              <div className="text-xs text-red-800">{error}</div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || authLoading} 
            className="w-full py-3 text-xs font-bold uppercase tracking-widest text-white rounded" 
            style={{ backgroundColor: '#800000', opacity: (loading || authLoading) ? 0.85 : 1 }}
          >
            {loading || authLoading ? <Loader size={16} className="animate-spin" /> : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/40">
          Don't have an account? <a href="/signup" style={{ color: '#800000' }} className="font-bold">Create one</a>
        </div>
      </div>
    </main>
  );
}
