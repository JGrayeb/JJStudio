// app/hooks/useAuth.ts
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: 'client' | 'trainer' | 'admin';
  bio?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        setLoading(true);
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (!mounted) return;
        setUser(currentUser ?? null);

        if (currentUser) {
          const { data, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (profileError) throw profileError;
          setProfile(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth init error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const current = session?.user ?? null;
        setUser(current);
        if (current) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', current.id)
            .single();
          setProfile(data ?? null);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'client' | 'trainer' = 'client'
  ) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: data.user.id,
            email,
            full_name: fullName,
            role,
          },
        ]);
        if (profileError) throw profileError;
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      setProfile((p) => (p ? { ...p, ...updates } : p));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      throw err;
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}