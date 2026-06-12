
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, BookOpen, Users, TrendingUp, AlertCircle, Award, Clock, Zap, Mail, Check } from 'lucide-react';

type UserStats = {
  classesThisMonth: number;
  progressToGoal: number;
  goalTarget: number;
  favoriteClass: { name: string; count: number } | null;
  favoriteCoach: { name: string; count: number } | null;
  activePackages: Array<{
    id: string;
    name: string;
    classCreditsRemaining: number;
    expiresIn: number;
    expiryDate: string;
    isNextToUse: boolean;
  }>;
};

const CLASS_CATEGORIES = [
  { id: 'full_body', label: 'Full Body', color: 'bg-red-600' },
  { id: 'low_body', label: 'Low Body', color: 'bg-purple-600' },
  { id: 'arms', label: 'Arms', color: 'bg-blue-600' },
  { id: 'core', label: 'Core', color: 'bg-yellow-600' },
  { id: 'newby', label: 'Newby', color: 'bg-green-600' },
  { id: '55plus', label: '55+', color: 'bg-orange-600' },
  { id: 'hell', label: 'HELL', color: 'bg-pink-600' },
];

export default function ClientDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    classesThisMonth: 0,
    progressToGoal: 0,
    goalTarget: 0,
    favoriteClass: null,
    favoriteCoach: null,
    activePackages: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);
        
        // ✅ CHECK IF EMAIL IS VERIFIED
        const emailConfirmedAt = user.user_metadata?.email_confirmed_at || user.confirmed_at;
        setIsEmailVerified(!!emailConfirmedAt);
        
        await fetchDashboardStats(user.id);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard');
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase]);

  // ✅ RESEND VERIFICATION EMAIL
  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setResendLoading(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/signup`,
        },
      });

      if (resendError) throw resendError;
      
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000); // Clear message after 5s
    } catch (err) {
      console.error('Resend error:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const fetchDashboardStats = async (userId: string) => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      console.log('🔍 Fetching dashboard stats for user:', userId);

      // ✅ STEP 1: Get bookings with classes
      const { data: bookings, error: bookingsError } = await supabase
        .from('class_bookings')
        .select(`
          id, 
          attended, 
          classes(
            id,
            name, 
            focus
          )
        `)
        .eq('user_id', userId)
        .gte('signed_up_at', monthStart.toISOString())
        .lte('signed_up_at', monthEnd.toISOString())
        .eq('attended', true);

      if (bookingsError) {
        console.error('❌ Bookings error:', bookingsError);
        throw new Error(`Bookings fetch failed: ${bookingsError.message}`);
      }
      console.log('✅ Bookings fetched:', bookings);

      // ✅ STEP 2: Get all coaches for the classes
      const classIds = [...new Set(bookings?.map((b: any) => b.classes?.id).filter(Boolean) || [])];
      console.log('🔍 Class IDs:', classIds);

      let coachMap = new Map<string, string>();
      if (classIds.length > 0) {
        const { data: classCoaches, error: ccError } = await supabase
          .from('class_coaches')
          .select('class_id, coaches(name)')
          .in('class_id', classIds);

        if (ccError) {
          console.error('⚠️ Class coaches error (non-critical):', ccError);
        } else {
          console.log('✅ Class coaches fetched:', classCoaches);
          classCoaches?.forEach((cc: any) => {
            const coachName = cc.coaches?.name || 'Unknown';
            coachMap.set(cc.class_id, coachName);
          });
        }
      }

      // ✅ STEP 3: Fetch packages
      const { data: packagesData, error: pkgError } = await supabase
        .from('user_packages')
        .select('id, created_at, expires_at, class_credits_remaining, package_id')
        .eq('user_id', userId);

      if (pkgError) {
        console.error('❌ Packages error:', pkgError);
        throw new Error(`Packages fetch failed: ${pkgError.message}`);
      }
      console.log('✅ Packages fetched:', packagesData);

      // ✅ Fetch packages metadata
      let packagesWithMeta: any[] = [];
      if (packagesData && packagesData.length > 0) {
        const packageIds = packagesData.map((p: any) => p.package_id);
        
        const { data: pkgMeta, error: metaError } = await supabase
          .from('packages')
          .select('id, name, class_credits, expire_days')
          .in('id', packageIds);

        if (metaError) {
          console.error('❌ Package metadata error:', metaError);
          throw new Error(`Package metadata failed: ${metaError.message}`);
        }

        packagesWithMeta = packagesData.map((up: any) => {
          const pkgInfo = pkgMeta?.find((p: any) => p.id === up.package_id);
          return { ...up, packages: pkgInfo };
        });
      }

      console.log('✅ Combined package data:', packagesWithMeta);

      // ✅ CALCULATE STATS WITH CORRECT GOAL
      const classesThisMonth = bookings?.length || 0;
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const goalTarget = Math.ceil(daysInMonth * 0.8); // 80% of days in month
      const progressToGoal = Math.min((classesThisMonth / goalTarget) * 100, 100);

      console.log(`📊 Stats: ${classesThisMonth} / ${goalTarget} classes (${daysInMonth} days in month)`);

      // Map packages
      const filteredPackages =
        packagesWithMeta
          .map((pkg: any) => {
            const packageMeta = pkg.packages || {};
            const expiryDate = pkg.expires_at 
              ? new Date(pkg.expires_at) 
              : new Date();

            const daysRemaining = Math.ceil(
              (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            const creditsRemaining = pkg.class_credits_remaining || 0;

            return {
              id: pkg.id,
              name: packageMeta.name || 'Package',
              classCreditsRemaining: creditsRemaining,
              expiresIn: daysRemaining,
              expiryDate: expiryDate.toLocaleDateString(),
              isExpired: daysRemaining <= 0,
            };
          })
          .filter((pkg: any) => pkg && !pkg.isExpired && pkg.classCreditsRemaining > 0)
          .sort((a: any, b: any) => a.expiresIn - b.expiresIn) || [];

      const activePackages = filteredPackages.map((pkg: any, index: number) => ({
        ...pkg,
        isNextToUse: index === 0,
      }));

      console.log('✅ Final active packages:', activePackages);

      // Find favorite class
      const classCount = new Map<string, number>();
      bookings?.forEach((b: any) => {
        const className = b.classes?.name || 'Unknown';
        classCount.set(className, (classCount.get(className) || 0) + 1);
      });

      let favoriteClass: { name: string; count: number } | null = null;
      let maxCount = 0;
      classCount.forEach((count, name) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteClass = { name, count };
        }
      });

      // ✅ Find favorite coach
      const coachCount = new Map<string, number>();
      bookings?.forEach((b: any) => {
        const classId = b.classes?.id;
        const coachName = coachMap.get(classId) || 'Unknown';
        coachCount.set(coachName, (coachCount.get(coachName) || 0) + 1);
      });

      let favoriteCoach: { name: string; count: number } | null = null;
      let maxCoachCount = 0;
      coachCount.forEach((count, name) => {
        if (count > maxCoachCount) {
          maxCoachCount = count;
          favoriteCoach = { name, count };
        }
      });

      console.log('✅ Favorite coach:', favoriteCoach);

      setStats({
        classesThisMonth,
        progressToGoal,
        goalTarget,
        favoriteClass,
        favoriteCoach,
        activePackages,
      });
    } catch (err: any) {
      console.error('❌ FULL STATS ERROR:', err);
      console.error('Error message:', err.message);
      setError(`Failed to load dashboard stats: ${err.message}`);
    }
  };

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
        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-2" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>
            Welcome back, <span className="text-red-600">{user?.email?.split('@')[0]}</span>
          </h1>
          <div className="h-1.5 w-20 bg-gradient-to-r from-red-800 via-red-600 to-red-500" style={{ boxShadow: '0 0 10px #C41E3A' }} />
        </div>

        {/* ✅ EMAIL VERIFICATION BANNER */}
        {!isEmailVerified && (
          <div className="mb-8 bg-yellow-900/30 border-2 border-yellow-700 rounded-lg p-6" style={{ boxShadow: '0 0 15px rgba(234, 179, 8, 0.2)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Mail size={32} className="text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-black text-lg uppercase tracking-wide mb-2">Account Not Verified</h3>
                  <p className="text-yellow-200 font-semibold mb-4">
                    Verify your email to register your data and gain full access to your packages.
                  </p>
                </div>
              </div>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-6 py-3 rounded font-bold uppercase tracking-wide transition flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                style={{ boxShadow: '0 0 10px rgba(234, 179, 8, 0.3)' }}
              >
                {resendLoading ? (
                  <>
                    <div className="animate-spin">⏳</div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Verify Now
                  </>
                )}
              </button>
            </div>

            {/* Verification Sent Message */}
            {verificationSent && (
              <div className="mt-4 p-3 bg-green-900/40 border border-green-700 rounded flex items-center gap-2">
                <Check size={20} className="text-green-400" />
                <p className="text-green-300 font-semibold">✓ Verification email sent! Check your inbox.</p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border-2 border-red-700 text-red-200 p-4 rounded-lg mb-8 flex items-center gap-3">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

        {/* Active Packages Section */}
        {stats.activePackages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-white mb-6 uppercase">Your Active Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.activePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-black border-2 rounded-lg p-4 relative transition-all ${
                    pkg.isNextToUse
                      ? 'border-green-500 ring-2 ring-green-500/50'
                      : pkg.expiresIn <= 3
                      ? 'border-yellow-600 ring-2 ring-yellow-600/30'
                      : 'border-red-700'
                  }`}
                  style={{
                    boxShadow: pkg.isNextToUse
                      ? '0 0 20px rgba(34, 197, 94, 0.3)'
                      : '0 0 20px rgba(196, 30, 58, 0.2)',
                  }}
                >
                  {pkg.isNextToUse && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-bl-lg">
                      WILL USE
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-black text-white">{pkg.name}</h3>
                      <p className="text-sm text-gray-400">
                        {pkg.classCreditsRemaining === 999 ? '∞ Unlimited' : pkg.classCreditsRemaining} credits
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap
                        size={16}
                        className={pkg.isNextToUse ? 'text-green-500' : 'text-red-600'}
                      />
                      <span
                        className={`font-bold ${
                          pkg.isNextToUse ? 'text-green-500' : 'text-red-600'
                        }`}
                      >
                        {pkg.classCreditsRemaining === 999 ? '∞' : pkg.classCreditsRemaining}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-2 p-2 rounded ${
                      pkg.isNextToUse ? 'bg-green-900/30' : 'bg-gray-900'
                    }`}
                  >
                    <Clock
                      size={16}
                      className={
                        pkg.isNextToUse
                          ? 'text-green-500'
                          : pkg.expiresIn <= 3
                          ? 'text-yellow-500'
                          : 'text-gray-400'
                      }
                    />
                    <div>
                      <p className="text-xs text-gray-400">Expires in</p>
                      <p
                        className={`font-bold text-sm ${
                          pkg.isNextToUse
                            ? 'text-green-400'
                            : pkg.expiresIn <= 3
                            ? 'text-yellow-500'
                            : 'text-white'
                        }`}
                      >
                        {pkg.expiresIn} day{pkg.expiresIn !== 1 ? 's' : ''} ({pkg.expiryDate})
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Classes This Month */}
          <div
            className="bg-black border-2 border-red-700 rounded-lg p-8"
            style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <BookOpen size={40} className="text-red-600" style={{ filter: 'drop-shadow(0 0 8px #C41E3A)' }} />
            </div>
            <p className="text-gray-400 text-sm uppercase font-bold tracking-wide">Classes This Month</p>
            <p className="text-6xl font-black text-white mt-3" style={{ fontWeight: 800 }}>
              {stats.classesThisMonth}
            </p>
            <p className="text-sm text-red-400 mt-3">One class at a time 💪</p>
          </div>

          {/* Progress to Goal */}
          <div
            className="bg-black border-2 border-red-700 rounded-lg p-8"
            style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <TrendingUp size={40} className="text-red-600" style={{ filter: 'drop-shadow(0 0 8px #C41E3A)' }} />
            </div>
            <p className="text-gray-400 text-sm uppercase font-bold tracking-wide">
              Reach {stats.goalTarget} classes for a reward
            </p>
            <p className="text-6xl font-black text-white mt-3" style={{ fontWeight: 800 }}>
              {Math.round(stats.progressToGoal)}%
            </p>
            <div className="mt-4 w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-500"
                style={{ width: `${stats.progressToGoal}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-3">
              {Math.max(0, stats.goalTarget - stats.classesThisMonth)} more classes to reach your goal
            </p>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Favorite Class */}
          {stats.favoriteClass ? (
            <div
              className="bg-black border-2 border-red-700 rounded-lg p-8"
              style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-white">Your Favorite Class</h3>
                <Award size={32} className="text-red-600" />
              </div>
              <p className="text-4xl font-black text-red-600 mt-4">{stats.favoriteClass.name}</p>
              <p className="text-gray-400 mt-3">
                You've attended <span className="text-red-400 font-bold">{stats.favoriteClass.count} times</span> this month
              </p>
            </div>
          ) : (
            <div
              className="bg-black border-2 border-gray-700 rounded-lg p-8"
              style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.1)' }}
            >
              <h3 className="text-2xl font-black text-gray-500">Your Favorite Class</h3>
              <p className="text-gray-400 mt-4">Start booking classes to see your favorite!</p>
            </div>
          )}

          {/* Favorite Coach */}
          {stats.favoriteCoach ? (
            <div
              className="bg-black border-2 border-red-700 rounded-lg p-8"
              style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-white">Your Favorite Coach</h3>
                <Users size={32} className="text-red-600" />
              </div>
              <p className="text-4xl font-black text-red-600 mt-4">{stats.favoriteCoach.name}</p>
              <p className="text-gray-400 mt-3">
                You've trained with them <span className="text-red-400 font-bold">{stats.favoriteCoach.count} times</span> this month
              </p>
            </div>
          ) : (
            <div
              className="bg-black border-2 border-gray-700 rounded-lg p-8"
              style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.1)' }}
            >
              <h3 className="text-2xl font-black text-gray-500">Your Favorite Coach</h3>
              <p className="text-gray-400 mt-4">Book with coaches to see your favorite!</p>
            </div>
          )}
        </div>

        {/* Class Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-white mb-6 uppercase">Our Class Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {CLASS_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => router.push('/classes')}
                className={`${category.color} hover:opacity-90 text-white font-bold py-6 px-4 rounded-lg transition transform hover:scale-105 text-center`}
              >
                <p className="text-sm font-black">{category.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/classes')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded font-bold uppercase tracking-wide transition flex items-center justify-center gap-2"
            style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.3)' }}
          >
            <BookOpen size={20} />
            Book Your Next Class
          </button>
          <button
            onClick={() => router.push('/bookings')}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded font-bold uppercase tracking-wide border-2 border-red-700 transition flex items-center justify-center gap-2"
            style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.1)' }}
          >
            <Award size={20} />
            My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
