
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LoginComponent() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!user) throw new Error('Login failed');

      // Fetch user role from database
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.warn('Could not fetch user role:', fetchError);
        // Default to member dashboard if role not found
        router.push('/app/dashboard/client');
        return;
      }

      // Redirect based on role
      const role = userData?.role || 'member';

      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'trainer') {
        router.push('/dashboard/trainer');
      } else {
        // member, client, or anything else goes to client dashboard
        router.push('/app/dashboard/client');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-900 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <span className="text-4xl font-black tracking-tight">JJ</span>
            <span className="text-4xl font-black ml-1" style={{ color: '#C41E3A' }}>STUDIO</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="border border-white/10 rounded-lg p-8 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider font-bold mb-2 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-white/30" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/30 rounded transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-white/60 uppercase tracking-wider font-bold">
                  Password
                </label>
                <a href="/forgot-password" className="text-xs font-bold" style={{ color: '#C41E3A' }}>
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-white/30" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/30 rounded transition"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex gap-3 p-3 bg-red-900/20 border border-red-900/50 rounded">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-200">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded font-bold uppercase tracking-wider text-sm text-white transition duration-300 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#C41E3A',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-8 text-center text-sm text-white/50">
            Don't have an account?{' '}
            <a href="/signup" className="font-bold" style={{ color: '#C41E3A' }}>
              Create one
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/30 mt-8">
          Secure login powered by industry standards
        </p>
      </div>
    </main>
  );
}
