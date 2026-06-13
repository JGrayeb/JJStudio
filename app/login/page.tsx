
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isEmailValid && password.length > 0 && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setError('');
      setIsLoading(true);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (authError) {
        if (authError.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(authError.message || 'Login failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        setIsLoading(false);
        router.push('/dashboard');
      } else {
        setIsLoading(false);
        setError('Login failed. No user returned.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950 flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
        
        input:focus {
          box-shadow: 0 0 20px rgba(200, 0, 0, 0.4), inset 0 0 10px rgba(200, 0, 0, 0.1) !important;
        }
        
        button:not(:disabled):hover {
          box-shadow: 0 0 25px rgba(200, 0, 0, 0.5) !important;
          transform: translateY(-2px);
        }
      `}</style>

      <div className="w-full max-w-md">
        <div className="bg-black border-2 border-red-700 rounded-lg p-8" style={{ boxShadow: '0 0 30px rgba(200, 0, 0, 0.3)' }}>
          <div className="mb-8">
            <div className="text-center mb-6">
              <span className="text-white font-black text-2xl" style={{ fontWeight: 800 }}>JJ</span>
              <span className="text-red-600 font-black text-2xl" style={{ fontWeight: 800, textShadow: '0 0 8px #CC0000' }}>STUDIO</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-3" style={{ fontWeight: 800, letterSpacing: '0.1em' }}>SIGN IN</h1>
            <div className="h-1.5 w-14 bg-gradient-to-r from-red-800 via-red-600 to-red-500 mx-auto mb-4" style={{ boxShadow: '0 0 10px #CC0000' }} />
            <p className="text-gray-300 font-bold uppercase tracking-wide text-sm">WELCOME BACK TO YOUR TRANSFORMATION</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-700 rounded flex items-start gap-3" style={{ boxShadow: '0 0 15px rgba(200, 0, 0, 0.2)' }}>
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide" style={{ fontWeight: 700, letterSpacing: '0.08em' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-black border-2 border-red-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition font-semibold"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                disabled={isLoading}
              />
              {email && !isEmailValid && <p className="text-red-500 text-xs mt-1 font-bold">Invalid email format</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide" style={{ fontWeight: 700, letterSpacing: '0.08em' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-black border-2 border-red-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition font-semibold pr-12"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3 rounded font-black uppercase tracking-wide flex items-center justify-center gap-2 transition mt-6 ${
                isFormValid ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer border-2 border-red-500' : 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'
              }`}
              style={{
                fontWeight: 800,
                letterSpacing: '0.12em',
                boxShadow: isFormValid ? '0 0 20px rgba(200, 0, 0, 0.3)' : 'none',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  SIGNING IN
                </>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-red-900" />
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wide">New member?</span>
            <div className="flex-1 h-px bg-red-900" />
          </div>

          <a
            href="/signup"
            className="w-full py-3 rounded font-black text-center bg-black border-2 border-red-700 hover:bg-red-700/10 text-white transition uppercase tracking-wide block"
            style={{
              fontWeight: 800,
              letterSpacing: '0.1em',
              boxShadow: '0 0 15px rgba(200, 0, 0, 0.2)',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Create Account
          </a>

          <p className="text-center text-gray-500 text-xs mt-6 uppercase tracking-wider font-bold">
            <a href="/forgot-password" className="text-red-600 hover:text-red-400 transition">Forgot password?</a>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6 uppercase tracking-wider font-bold">Ready to transform? Sign in to your journey.</p>
      </div>
    </div>
  );
}
