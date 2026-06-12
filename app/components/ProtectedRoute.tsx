'use client';
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';

type Props = {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'trainer' | 'admin')[];
};

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (allowedRoles && allowedRoles.length > 0) {
        const role = userProfile?.role;
        if (!role || !allowedRoles.includes(role as any)) {
          // if role mismatch, redirect to base dashboard
          router.replace('/dashboard');
        }
      }
    }
  }, [user, userProfile, loading, allowedRoles, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return <>{children}</>;
};