
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff, Loader, CheckCircle, Mail } from 'lucide-react';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const verificationToken = searchParams.get('code');
  const selectedPackage = searchParams.get('package'); // Get package from URL params

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
          // If package was selected, redirect to packages page to complete purchase
          if (selectedPackage) {
            router.push(`/packages?package=${selectedPackage}`);
          } else {
            router.push('/dashboard');
          }
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
          emailRedirectTo: `${window.location.origin}/signup${selectedPackage ? `?package=${selectedPackage}` : ''}`,
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
        return;
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
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950 flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="w-full max-w-md text-center">
          <div className="bg-black border-2 border-red-700 rounded-lg shadow-2xl p-8" style={{ boxShadow: '0 0 30px rgba(255, 0, 0, 0.25)' }}>
            <CheckCircle size={64} className="text-red-600 mx-auto mb-6" style={{ filter: 'drop-shadow(0 0 10px #CC0000)' }} />
            <h1 className="text-3xl font-black text-white mb-2" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>EMAIL VERIFIED!</h1>
            <p className="text-gray-400 mb-6 font-bold">Your account verified. Redirecting...</p>
            <Loader size={24} className="text-red-600 animate-spin mx-auto" style={{ filter: 'drop-shadow(0 0 8px #CC0000)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950 flex items-center justify-center p-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="w-full max-w-md">
          <div className="bg-black border-2 border-red-700 rounded-lg shadow-2xl p-8 text-center" style={{ boxShadow: '0 0 30px rgba(255, 0, 0, 0.25)' }}>
            <Mail size={64} className="text-red-600 mx-auto mb-6" style={{ filter: 'drop-shadow(0 0 10px #CC0000)' }} />
            <h1 className="text-3xl font-black text-white mb-4" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>VERIFY YOUR EMAIL</h1>
            <div className="h-1.5 w-16 bg-gradient-to-r from-red-900 to-red-600 mx-auto mb-6" style={{ boxShadow: '0 0 10px #CC0000' }} />
            <div className="bg-red-900/20 border-2 border-red-700 rounded p-4 mb-6" style={{ boxShadow: '0 0 15px rgba(200, 0, 0, 0.2)' }}>
              <p className="text-gray-300 text-sm mb-2 font-bold">VERIFICATION LINK SENT TO:</p>
              <p className="text-red-400 font-bold break-all text-base">{email}</p>
            </div>
            <p className="text-gray-300 text-sm mb-6 font-semibold">Click the link in your email to verify and auto-login.</p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-xs mb-4 font-bold">DIDN'T RECEIVE EMAIL?</p>
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
                className="text-red-600 hover:text-red-400 font-bold text-sm transition-colors uppercase tracking-wide"
              >
                TRY ANOTHER EMAIL
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-8 uppercase tracking-widest font-bold">CHECK SPAM FOLDER</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-4xl font-black text-white mb-3" style={{ fontWeight: 800, letterSpacing: '0.1em' }}>CREATE ACCOUNT</h1>
            <div className="h-1.5 w-14 bg-gradient-to-r from-red-800 via-red-600 to-red-500 mx-auto mb-4" style={{ boxShadow: '0 0 10px #CC0000' }} />
            <p className="text-gray-300 font-bold uppercase tracking-wide text-sm">START YOUR TRANSFORMATION TODAY</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-700 rounded flex items-start gap-3" style={{ boxShadow: '0 0 15px rgba(200