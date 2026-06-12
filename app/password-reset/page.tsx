'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function PasswordReset() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if a session already exists (Supabase sets it automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setError('Invalid or expired reset link. Please request a new one.');
          setLoading(false);
          return;
        }

        // Session exists, user can reset password
        setLoading(false);
      } catch (err) {
        setError('An error occurred: ' + String(err));
        setLoading(false);
      }
    };

    checkSession();
  }, [supabase]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError('Failed to update password: ' + error.message);
        return;
      }

      // Success
      await supabase.auth.signOut();
      router.push('/login?message=Password+updated.+Please+sign+in.');
    } catch (err) {
      setError('An error occurred: ' + String(err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Verifying reset link...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="border-2 border-red-700 rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-white mb-4">Reset Password</h1>
        
        {error && (
          <div className="bg-red-900 text-red-200 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded mb-4"
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 text-white font-bold py-2 px-4 rounded hover:bg-red-800 disabled:opacity-50"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}