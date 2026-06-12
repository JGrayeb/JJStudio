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
    const handleRecovery = async () => {
      try {
        // Get hash from URL (Supabase sends recovery tokens in #)
        const hash = window.location.hash.substring(1);
        
        if (!hash) {
          setError('No recovery token found');
          setLoading(false);
          return;
        }

        // Parse the hash params
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const type = params.get('type');

        if (!accessToken || type !== 'recovery') {
          setError('Invalid or expired reset link');
          setLoading(false);
          return;
        }

        // Set the session with the recovery token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: '', // Recovery tokens don't have refresh tokens
        });

        if (sessionError) {
          setError('Failed to verify recovery link: ' + sessionError.message);
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (err) {
        setError('An error occurred: ' + String(err));
        setLoading(false);
      }
    };

    handleRecovery();
  }, [supabase]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      setError('Please enter a new password');
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

      // Password updated successfully
      router.push('/login?message=Password+updated+successfully');
    } catch (err) {
      setError('An error occurred: ' + String(err));
    }
  };

  if (loading) {
    return <div>Verifying reset link...</div>;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="border-2 border-red-700 rounded-lg p-8 w-96">
        <h1 className="text-2xl font-bold text-white mb-4">Reset Password</h1>
        
        {error && (
          <div className="bg-red-900 text-red-200 p-3 rounded mb-4">
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
            className="w-full bg-red-700 text-white font-bold py-2 px-4 rounded hover:bg-red-800"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}