
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Route based on role
    switch (userProfile?.role) {
      case 'trainer':
        router.push('/dashboard/trainer');
        break;
      case 'admin':
        router.push('/dashboard/admin');
        break;
      case 'client':
      default:
        // Client dashboard stays at /dashboard/client (or keep using the existing dashboard)
        router.push('/dashboard/client');
        break;
    }
  }, [user, userProfile, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <Loader className="animate-spin mx-auto mb-4" size={48} style={{ color: '#800000' }} />
        <h2 className="text-xl font-black">Loading dashboard...</h2>
      </div>
    </div>
  );
}
