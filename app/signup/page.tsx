'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Loader, CheckCircle, Mail } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const verificationToken = searchParams.get('code');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [verificationState, setVerificationState] = useState<'pending' | 'verifying' | 'verified' | 'error'>('pending');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const isPasswordMatch = password === confirmPassword && password.length > 0;
  const isFirstNameValid = firstName.trim().length > 0;
  const isLastNameValid = lastName.trim().length > 0;

  const isFormValid = isEmailValid && isPasswordValid && isPasswordMatch && isFirstNameValid && isLastNameValid && !isLoading;

  useEffect(() => {
    if (verificationToken) {
      handleEmailVerification(verificationToken);
    }
  }, [verificationToken]);

  const handleEmailVerification = async (token: string) => {
    try {
      setVerificationState('verifying');
      const { data, error: verifyError } = await supabase.auth.exchangeCodeForSession(token);

      if (verifyError) {
        setVerificationState('error');
        setError('Email verification failed. Link may have expired.');
        return;
      }

      if (data.user) {
        setVerificationState('verified');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setVerificationState('error');
      setError('Verification error. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setError('');
      setIsLoading(true);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/signup`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          setError('This email is already registered. Please sign in or use a different email.');
        } else {
          setError(authError.message || 'Signup failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create user account');
        setIsLoading(false);
        return;
      }

const { error: profileError } = await supabase
  .from('users')
  .update({
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    created_at: new Date().toISOString(),
  })
  .eq('id', authData.user.id);

      if (profileError) {
  console.error('Profile creation error:', profileError);
  setError(`Failed to create profile: ${profileError.message}`);
  setIsLoading(false);
  return;  // ← Stop here, don't continue
      }

      setSignupSuccess(true);
      setIsLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  if (verificationState === 'verified') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-black border border-red-900 rounded-lg shadow-2xl p-8">
            <CheckCircle size={64} className="text-red-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Email Verified!</h1>
            <p className="text-gray-400 mb-6">Your account verified. Redirecting...</p>
            <Loader size={24} className="text-red-600 animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-black border border-red-900 rounded-lg shadow-2xl p-8 text-center">
            <Mail size={64} className="text-red-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <div className="h-1 w-12 bg-red-600 mx-auto mb-4" />
            <div className="bg-red-900/20 border border-red-600 rounded p-4 mb-6">
              <p className="text-gray-300 text-sm mb-2">Verification link sent to:</p>
              <p className="text-red-400 font-semibold break-all">{email}</p>
            </div>
            <p className="text-gray-400 text-sm mb-6">Click the link in your email to verify and auto-login.</p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-xs mb-4">Didn't receive email?</p>
              <button
                onClick={() => {
                  setSignupSuccess(false);
                  setFirstName('');
                  setLastName('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className="text-red-600 hover:text-red-500 font-semibold text-sm"
              >
                Try another email
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-8 uppercase tracking-wider">Check spam folder</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black border border-red-900 rounded-lg shadow-2xl p-8">
          <div className="mb-8">
            <div className="text-center mb-6">
              <span className="text-white font-bold text-xl">JJ</span>
              <span className="text-red-600 font-bold text-xl">STUDIO</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">CREATE ACCOUNT</h1>
            <div className="h-1 w-12 bg-red-600 mb-4" />
            <p className="text-gray-400">Start your transformation today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded flex items-start gap-3">
              <div className="text-red-600 mt-0.5">⚠️</div>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onFocus={() => setError('')}
                placeholder="John"
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onFocus={() => setError('')}
                placeholder="Doe"
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setError('')}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition"
                disabled={isLoading}
              />
              {email && !isEmailValid && <p className="text-red-500 text-xs mt-1">Invalid email</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setError('')}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && !isPasswordValid && <p className="text-red-500 text-xs mt-1">Min 8 characters</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase tracking-wide">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setError('')}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded text-white placeholder-gray-600 focus:outline-none focus:border-red-600 transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && !isPasswordMatch && <p className="text-red-500 text-xs mt-1">Passwords do not match</p>}
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input type="checkbox" id="terms" className="mt-1 accent-red-600" required />
              <label htmlFor="terms" className="text-xs text-gray-400">
                I agree to JJStudio's <a href="/terms" className="text-red-600 hover:text-red-500">Terms & Conditions</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3 rounded font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition mt-6 ${
                isFormValid ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  CREATING ACCOUNT
                </>
              ) : (
                'SIGN UP'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-500 uppercase">Already a member?</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <a
            href="/login"
            className="w-full py-3 rounded font-bold text-center bg-black border border-red-600 hover:bg-red-600/10 text-white transition uppercase tracking-wide block"
          >
            Sign In
          </a>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6 uppercase tracking-wider">Commit to your goal. Pick the plan that fits.</p>
      </div>
    </div>
  );
}