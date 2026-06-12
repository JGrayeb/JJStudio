'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';

function PasswordResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const code = searchParams.get('code');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const isPasswordValid = password.length >= 8;
  const isPasswordMatch = password === confirmPassword && password.length > 0;
  const isFormValid = isPasswordValid && isPasswordMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !code) return;

    try {
      setError('');
      setIsLoading(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      setResetSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950 flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="w-full max-w-md text-center">
          <div className="bg-black border-2 border-red-700 rounded-lg shadow-2xl p-8" style={{ boxShadow: '0 0 30px rgba(196, 30, 58, 0.25)' }}>
            <CheckCircle size={64} className="text-red-600 mx-auto mb-6" style={{ filter: 'drop-shadow(0 0 10px #C41E3A)' }} />
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>PASSWORD RESET!</h1>
            <p className="text-gray-400 mb-6 font-bold">Your password has been reset. Redirecting to login...</p>
            <Loader size={24} className="text-red-600 animate-spin mx-auto" style={{ filter: 'drop-shadow(0 0 8px #C41E3A)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950 flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="w-full max-w-md">
          <div className="bg-black border-2 border-red-700 rounded-lg p-8 text-center" style={{ boxShadow: '0 0 30px rgba(196, 30, 58, 0.3)' }}>
            <h1 className="text-2xl font-black text-white mb-4" style={{ fontWeight: 800 }}>INVALID LINK</h1>
            <p className="text-gray-400 mb-6">This password reset link is invalid or has expired.</p>
            <a
              href="/forgot-password"
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold uppercase tracking-wide transition"
              style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.3)' }}
            >
              Request New Link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950 flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <style>{`
        input:focus {
          box-shadow: 0 0 20px rgba(196, 30, 58, 0.4), inset 0 0 10px rgba(196, 30, 58, 0.1) !important;
        }
      `}</style>

      <div className="w-full max-w-md">
        <div className="bg-black border-2 border-red-700 rounded-lg p-8" style={{ boxShadow: '0 0 30px rgba(196, 30, 58, 0.3)' }}>
          <div className="mb-8">
            <div className="text-center mb-6">
              <span className="text-white font-black text-2xl" style={{ fontWeight: 800 }}>JJ</span>
              <span className="text-red-600 font-black text-2xl" style={{ fontWeight: 800, textShadow: '0 0 8px #C41E3A' }}>STUDIO</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-3" style={{ fontWeight: 800, letterSpacing: '0.1em' }}>RESET PASSWORD</h1>
            <div className="h-1.5 w-14 bg-gradient-to-r from-red-800 via-red-600 to-red-500 mx-auto mb-4" style={{ boxShadow: '0 0 10px #C41E3A' }} />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-700 rounded flex items-start gap-3" style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.2)' }}>
              <div className="text-red-600 mt-0.5 font-bold text-lg">⚠️</div>
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide" style={{ fontWeight: 700, letterSpacing: '0.08em' }}>New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setError('')}
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
              {password && !isPasswordValid && <p className="text-red-500 text-xs mt-1 font-bold">Min 8 characters</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide" style={{ fontWeight: 700, letterSpacing: '0.08em' }}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setError('')}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-black border-2 border-red-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition font-semibold pr-12"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && !isPasswordMatch && <p className="text-red-500 text-xs mt-1 font-bold">Passwords do not match</p>}
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
                boxShadow: isFormValid ? '0 0 20px rgba(196, 30, 58, 0.3)' : 'none',
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  RESETTING
                </>
              ) : (
                'RESET PASSWORD'
              )}
            </button>
          </form>

          <a
            href="/login"
            className="w-full py-3 rounded font-black text-center bg-black border-2 border-red-700 hover:bg-red-700/10 text-white transition uppercase tracking-wide block mt-4"
            style={{
              fontWeight: 800,
              letterSpacing: '0.1em',
              boxShadow: '0 0 15px rgba(196, 30, 58, 0.2)',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <PasswordResetContent />
    </Suspense>
  );
}