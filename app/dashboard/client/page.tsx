
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, Zap, Dumbbell, Coffee, Calendar, AlertCircle, BookOpen } from 'lucide-react';

type UserData = {
  classPoints: number;
  activePackage: { name: string; expiresIn: number } | null;
  beveragePoints: number;
  beverageExpiresIn: number | null;
};

export default function ClientDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData>({
    classPoints: 0,
    activePackage: null,
    beveragePoints: 0,
    beverageExpiresIn: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);

        // Fetch all active user packages with class credits
        const { data: packagesData, error: packagesError } = await supabase
          .from('user_packages')
          .select('created_at, packages(name, class_credits, expires_days)')
          .eq('user_id', user.id)
          .not('packages', 'is', null);

        if (packagesError) console.error('Packages error:', packagesError);

        // Calculate total class points and find earliest expiration
        let totalClassPoints = 0;
        let earliestExpiry: { name: string; expiresIn: number } | null = null;
        const now = new Date();

        packagesData?.forEach((pkg: any) => {
          if (pkg.packages) {
            totalClassPoints += pkg.packages.class_credits || 0;
            
            const createdDate = new Date(pkg.created_at);
            const expiryDate = new Date(createdDate.getTime() + (pkg.packages.expires_days * 24 * 60 * 60 * 1000));
            const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysRemaining > 0 && (!earliestExpiry || daysRemaining < earliestExpiry.expiresIn)) {
              earliestExpiry = {
                name: pkg.packages.name,
                expiresIn: daysRemaining,
              };
            }
          }
        });

        // Fetch latest beverage points (30-day expiration)
        const { data: beverageData, error: beverageError } = await supabase
          .from('beverage_points')
          .select('amount, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (beverageError && beverageError.code !== 'PGRST116') {
          console.error('Beverage error:', beverageError);
        }

        // Calculate beverage expiration (30 days from created_at)
        let beverageExpiresIn = null;
        if (beverageData) {
          const createdDate = new Date(beverageData.created_at);
          const expiryDate = new Date(createdDate.getTime() + (30 * 24 * 60 * 60 * 1000));
          beverageExpiresIn = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        }

        setUserData({
          classPoints: totalClassPoints,
          activePackage: earliestExpiry,
          beveragePoints: beverageData?.amount || 0,
          beverageExpiresIn: beverageExpiresIn && beverageExpiresIn > 0 ? beverageExpiresIn : null,
        });

        setLoading(false);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard');
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleBrowseClasses = () => {
    router.push('/app/classes');
  };

  const handleViewBookings = () => {
    router.push('/app/bookings');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-16 h-16 border-4 border-red-900 border-t-red-600 rounded-full mx-auto" />
          </div>
          <p className="text-white font-bold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Navigation */}
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
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-2" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>YOUR DASHBOARD</h1>
          <div className="h-1.5 w-20 bg-gradient-to-r from-red-800 via-red-600 to-red-500" style={{ boxShadow: '0 0 10px #C41E3A' }} />
          <p className="text-gray-400 mt-4 font-semibold">Welcome back, {user?.email}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border-2 border-red-700 text-red-200 p-4 rounded-lg mb-8 flex items-center gap-3">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Class Points Card */}
          <div
            className="bg-black border-2 border-red-700 rounded-lg p-8"
            style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <Dumbbell size={40} className="text-red-600" style={{ filter: 'drop-shadow(0 0 8px #C41E3A)' }} />
            </div>
            <p className="text-gray-400 text-sm uppercase font-bold tracking-wide">Class Points</p>
            <p className="text-5xl font-black text-white mt-3" style={{ fontWeight: 800 }}>
              {userData.classPoints}
            </p>
            {userData.activePackage && (
              <p className="text-sm text-red-400 mt-3">
                {userData.activePackage.name} • Expires in {userData.activePackage.expiresIn} days
              </p>
            )}
          </div>

          {/* Beverage Credits Card */}
          <div
            className="bg-black border-2 border-red-700 rounded-lg p-8"
            style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <Coffee size={40} className="text-red-600" style={{ filter: 'drop-shadow(0 0 8px #C41E3A)' }} />
            </div>
            <p className="text-gray-400 text-sm uppercase font-bold tracking-wide">Beverage Points</p>
            <p className="text-5xl font-black text-white mt-3" style={{ fontWeight: 800 }}>
              {userData.beveragePoints}
            </p>
            {userData.beverageExpiresIn !== null && (
              <p className="text-sm text-red-400 mt-3">
                Expires in {userData.beverageExpiresIn} {userData.beverageExpiresIn === 1 ? 'day' : 'days'}
              </p>
            )}
          </div>

          {/* Quick Stats Card */}
          <div
            className="bg-black border-2 border-red-700 rounded-lg p-8"
            style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <Zap size={40} className="text-red-600" style={{ filter: 'drop-shadow(0 0 8px #C41E3A)' }} />
            </div>
            <p className="text-gray-400 text-sm uppercase font-bold tracking-wide">Status</p>
            <p className="text-2xl font-black text-white mt-3">
              {userData.classPoints > 0 ? '✓ Ready to Train' : 'Get a Package'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={handleBrowseClasses}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded font-bold uppercase tracking-wide transition flex items-center justify-center gap-2"
            style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.3)' }}
          >
            <BookOpen size={20} />
            Browse & Book Classes
          </button>
          <button
            onClick={handleViewBookings}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded font-bold uppercase tracking-wide border-2 border-red-700 transition flex items-center justify-center gap-2"
            style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.1)' }}
          >
            <Calendar size={20} />
            My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
