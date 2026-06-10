'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Mail, Lock, User, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

export default function SignupComponent() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'trainer'>('client');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password, fullName, role);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg,#000 0%,#1a0000 40%,#000 100%)' }}>
        <div className="text-center">
          <CheckCircle size={48} style={{ color: '#800000' }} />
          <h2 className="mt-4 text-2xl font-black">Account Created</h2>
          <p className="text-sm text-white/50 mt-2">Check your email to confirm. Redirecting to login...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black uppercase tracking-widest inline-block mb-4">
            JJ<span style={{ color: '#800000' }}>Studio</span>
          </a>
          <div className="w-12 h-0.5 mx-auto mb-6" style={{ backgroundColor: '#800000' }} />
          <h1 className="text-3xl font-black uppercase">Create Account</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest mt-2">Join as client or trainer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest mb-2 block">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-white/30" size={18} />
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="John Doe"
                className="w-full pl-12 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-white/30" size={18} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full pl-12 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-white/30" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full pl-12 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest mb-2 block">Join as</label>
            <div className="flex gap-3">
              <label className={`flex gap-2 items-center px-3 py-2 border rounded cursor-pointer ${role === 'client' ? 'border-red-900 bg-white/3' : 'border-white/10'}`}>
                <input type="radio" name="role" value="client" checked={role === 'client'} onChange={() => setRole('client')} />
                <span className="text-sm ml-1">Client</span>
              </label>
              <label className={`flex gap-2 items-center px-3 py-2 border rounded cursor-pointer ${role === 'trainer' ? 'border-red-900 bg-white/3' : 'border-white/10'}`}>
                <input type="radio" name="role" value="trainer" checked={role === 'trainer'} onChange={() => setRole('trainer')} />
                <span className="text-sm ml-1">Trainer</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex gap-3 p-3 bg-white/5 border border-red-900/30 rounded">
              <AlertCircle size={18} className="text-red-800" />
              <div className="text-xs text-red-800">{error}</div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-white rounded" style={{ backgroundColor: '#800000', opacity: loading ? 0.85 : 1 }}>
            {loading ? <Loader size={16} className="animate-spin" /> : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/40">
          Already have an account? <a href="/login" style={{ color: '#800000' }} className="font-bold">Sign in</a>
        </div>
      </div>
    </main>
  );
}