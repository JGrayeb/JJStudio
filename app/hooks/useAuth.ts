
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "client" | "trainer" | "admin";
  avatar_url?: string;
  created_at?: string;
}

interface UseAuthReturn {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string;
  signUp: (email: string, password: string, fullName: string, role?: "client" | "trainer") => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user profile from public.users table
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;
      setUserProfile(data as UserProfile);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        }
        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [fetchUserProfile]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: "client" | "trainer" = "client"
  ) => {
    try {
      setError("");
      
      // Sign up user in auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Update user profile in public.users table (trigger already created it)
      if (authData.user) {
        const [firstName, ...lastNameParts] = fullName.split(' ');
        const lastName = lastNameParts.join(' ') || '';

        const { error: profileError } = await supabase
          .from("users")
          .update({  // ← CHANGED FROM .insert() to .update()
            first_name: firstName,
            last_name: lastName,
            role,
          })
          .eq("id", authData.user.id);  // ← Update where ID matches

        if (profileError) throw profileError;
        
        setUser(authData.user);
        await fetchUserProfile(authData.user.id);
      }

      return authData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Signup failed";
      setError(errorMsg);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError("");
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        setUser(data.user);
        await fetchUserProfile(data.user.id);
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign in failed";
      setError(errorMsg);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError("");
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      setUser(null);
      setUserProfile(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign out failed";
      setError(errorMsg);
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError("");
      
      if (!user) throw new Error("No user logged in");

      const { error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (updateError) throw updateError;

      setUserProfile((prev) => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Update failed";
      setError(errorMsg);
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
    updateProfile,
  };
};
