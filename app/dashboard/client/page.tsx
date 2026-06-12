'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, Dumbbell, Heart, TrendingUp } from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-16 h-16 border-4 border-red-900 border-t-red-600 rounded-full mx-auto" />
          </div>
          <p className="text-white font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <nav className="bg-black border-b-2 border-red-700" style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <span className="text-white font-black text-xl">JJ</span>
            <span className="text-red-600 font-black text-xl" style={{ textShadow: '0 0 8px #C41E3A' }}>STUDIO</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold uppercase tracking-wide flex items-center gap-2 transition"
            style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.3)' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-2" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>YOUR TRANSFORMATION</h1>
          <div className="h-1.5 w-20 bg-gradient-to-r from-red-800 via-red-600 to-red-500" style={{ boxShadow: '0 0 10px #C41E3A' }} />
          <p className="text-gray-400 mt-4 font-semibold">Welcome, {user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Dumbbell, label: 'Classes Attended', value: '0' },
            { icon: Heart, label: 'Current Streak', value: '0 days' },
            { icon: TrendingUp, label: 'Progress', value: '0%' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-black border-2 border-red-700 rounded-lg p-6"
              style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon size={32} className="text-red-600" />
              </div>
              <p className="text-gray-400 text-sm uppercase font-bold tracking-wide">{stat.label}</p>
              <p className="text-4xl font-black text-white mt-2" style={{ fontWeight: 800 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-black border-2 border-red-700 rounded-lg p-8" style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}>
          <h2 className="text-2xl font-black text-white mb-6" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>UPCOMING CLASSES</h2>
          <p className="text-gray-400">No classes booked yet. Browse available classes and book your first session!</p>
          <button
            className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold uppercase tracking-wide transition"
            style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.3)' }}
          >
            Browse Classes
          </button>
        </div>
      </div>
    </div>
  );
}