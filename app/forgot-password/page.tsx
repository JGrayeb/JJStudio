'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess('If that email exists, a password reset link was sent. Check your inbox.');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black uppercase tracking-widest inline-block mb-4">
            JJ<span style={{ color: '#800000' }}>Studio</span>
          </a>
          <p className="text-sm text-white/50">Enter your email and we'll send a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full py-3 px-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-white/5 border border-red-900/30 rounded text-xs text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-white/5 border border-green-600/30 rounded text-xs text-green-400">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs font-bold uppercase tracking-widest text-white rounded"
            style={{ backgroundColor: '#800000', opacity: loading ? 0.85 : 1 }}
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/40">
            Remembered your password? <Link href="/login" className="font-bold" style={{ color: '#800000' }}>Sign in</Link>
        </div>
      </div>
    </main>
  );
}