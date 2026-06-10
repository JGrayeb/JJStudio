
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: "client" | "trainer" | "admin";
  avatar_url?: string;
  bio?: string;
}

export function useAuth() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let subscription: any;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Fetch user profile
            const { data: profileData } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();
            
            setProfile(profileData);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Auth init error");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (mounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const { data: profileData } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single();
            
            setProfile(profileData);
          } else {
            setProfile(null);
          }
        }
      }
    );

    subscription = data?.subscription;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: "client" | "trainer" = "client"
  ) => {
    try {
      setError("");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from("users")
          .insert([
            {
              id: authData.user.id,
              email,
              full_name: fullName,
              role,
            },
          ]);

        if (profileError) throw profileError;
      }

      return authData;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Signup failed";
      setError(errorMsg);
      throw err;
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setError("");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign in failed";
      setError(errorMsg);
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError("");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      router.push("/");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign out failed";
      setError(errorMsg);
      throw err;
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...updates } as UserProfile);
      return profile;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Update failed";
      setError(errorMsg);
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
  };
}
