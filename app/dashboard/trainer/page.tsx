'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader, AlertCircle } from 'lucide-react';

export default function PasswordResetPage() {
  const supabase = createClient();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'in-progress'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Some Supabase flows provide an access_token or type=recovery param in URL.
    // If the redirect includes ?type=recovery&access_token=..., you may need to try:
    // supabase.auth.setSession({ access_token, refresh_token }) or call supabase.auth.getSessionFromUrl()
    // For now detect presence of tokens and show appropriate UI.
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token') || params.get('token');
    const type = params.get('type');
    if (accessToken || type === 'recovery') {
      setHasToken(true);
    } else {
      setHasToken(false);
    }
  }, []);

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Attempt to update the user's password using the session established by the recovery link
      // supabase-js v2: supabase.auth.updateUser({ password: newPassword })
      // If your flow requires exchanging a code first, you may need to call supabase.auth.getSessionFromUrl()
      // Try v2 flow:
      // @ts-ignore
      if (typeof supabase.auth.updateUser === 'function') {
        // @ts-ignore
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setStatus('success');
        setTimeout(() => router.push('/login'), 1800);
      } else {
        throw new Error('Password reset flow needs to be configured for your Supabase client version.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!hasToken) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-black">Password reset</h1>
          <p className="mt-3 text-sm text-white/50">We sent you a password reset link. Please check your email and follow the link. If it redirected here with a token, you'll be able to set a new password below.</p>
          <div className="mt-6">
            <a href="/forgot-password" className="px-4 py-2 bg-red-900 rounded">Resend reset email</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-black mb-4">Set a new password</h1>
        <form onSubmit={submitNewPassword} className="space-y-4">
          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest mb-2 block">New password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded text-white" />
          </div>

          {error && (
            <div className="flex gap-3 p-3 bg-white/5 border border-red-900/30 rounded">
              <AlertCircle size={18} className="text-red-800" />
              <div className="text-xs text-red-800">{error}</div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-white rounded" style={{ backgroundColor: '#800000', opacity: loading ? 0.85 : 1 }}>
            {loading ? <Loader className="animate-spin" size={16} /> : 'Set new password'}
          </button>
        </form>
      </div>
    </main>
  );
}