'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (userData?.role === 'trainer') {
        router.push('/dashboard/trainer');
      } else if (userData?.role === 'client') {
        router.push('/dashboard/client');
      } else {
        router.push('/login');
      }
    };

    checkRole();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950 flex items-center justify-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="text-center">
        <div className="animate-spin mb-4">
          <div className="w-16 h-16 border-4 border-red-900 border-t-red-600 rounded-full mx-auto" />
        </div>
        <p className="text-white font-bold uppercase tracking-wide">Loading your dashboard...</p>
      </div>
    </div>
  );
}