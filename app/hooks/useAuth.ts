
'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useCallback } from 'react';

type UserProfile = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: 'client' | 'trainer' | 'admin' | null;
  avatar_url?: string | null;
};

export function useAuth() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(
    async (uid: string) => {
      try {
        const { data, error: profileError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, role, avatar_url')
          .eq('id', uid)
          .single();
        if (profileError) throw profileError;
        setUserProfile(data);
      } catch (err) {
        console.error('fetchProfile error:', err);
        setUserProfile(null);
      }
    },
    [supabase]
  );

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        setUser(data.user ?? null);
        if (data.user?.id) {
          await fetchProfile(data.user.id);
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string = '',
    role: 'client' | 'trainer' | 'admin' = 'client'
  ) => {
    try {
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user?.id) throw new Error('Signup failed - no user created');

      const [firstName, ...lastNameParts] = fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const { error: profileError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email,
          first_name: firstName || '',
          last_name: lastName,
          role,
        },
      ]);

      if (profileError) throw profileError;

      return authData.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      setUser(null);
      setUserProfile(null);
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      // Remove www. from origin to match Supabase config
      const origin = window.location.origin
        .replace('https://www.', 'https://')
        .replace('http://www.', 'http://');
      const redirectTo = `${origin}/password-reset`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (resetError) throw resetError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      throw err;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password update failed';
      setError(message);
      throw err;
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
}
