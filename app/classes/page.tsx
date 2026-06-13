
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, BookOpen, Users, TrendingUp, AlertCircle, Award, Clock, Zap, Mail, Check, Plus, ShoppingBag, Calendar, Dumbbell } from 'lucide-react';

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

type TabType = 'dashboard' | 'classes' | 'bookings' | 'packages' | 'beverages';

const CLASS_CATEGORIES = [
  { id: 'full_body', label: 'Full Body', color: 'bg-red-600' },
  { id: 'low_body', label: 'Low Body', color: 'bg-purple-600' },
  { id: 'arms', label: 'Arms', color: 'bg-blue-600' },
  { id: 'core', label: 'Core', color: 'bg-yellow-600' },
  { id: 'newby', label: 'Newby', color: 'bg-green-600' },
  { id: '55plus', label: '55+', color: 'bg-orange-600' },
  { id: 'hell', label: 'HELL', color: 'bg-pink-600' },
];

export default function UnifiedDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
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
        
        const isVerified = !!(
          user.user_metadata?.email_confirmed_at || 
          user.user_metadata?.email_verified ||
          user.confirmed_at ||
          (user.email_confirmed_at && user.email_confirmed_at !== null)
        );
        
        setIsEmailVerified(isVerified);
        
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

  const handleResendVerification = async () => {
    if (!user?.email) {
      setError('Email not found');
      return;
    }
    
    setResendLoading(true);
    setError(null);
    
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
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend verification email';
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const fetchDashboardStats = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: bookings, error: bookingsError } = await supabase
        .from('class_bookings')
        .select(`id, attended, classes(id, name, focus)`)
        .eq('user_id', userId)
        .gte('signed_up_at', monthStart.toISOString())
        .lte('signed_up_at', monthEnd.toISOString())
        .eq('attended', true);

      if (bookingsError) throw new Error(`Bookings fetch failed: ${bookingsError.message}`);

      const classIds = [...new Set(bookings?.map((b: any) => b.classes?.id).filter(Boolean) || [])];

      let coachMap = new Map<string, string>();
      if (classIds.length > 0) {
        const { data: classCoaches } = await supabase
          .from('class_coaches')
          .select('class_id, coaches(name)')
          .in('class_id', classIds);

        classCoaches?.forEach((cc: any) => {
          coachMap.set(cc.class_id, cc.coaches?.name || 'Unknown');
        });
      }

      const { data: packagesData } = await supabase
        .from('user_packages')
        .select('id, created_at, expires_at, class_credits_remaining, package_id')
        .eq('user_id', userId);

      let packagesWithMeta: any[] = [];
      if (packagesData && packagesData.length > 0) {
        const packageIds = packagesData.map((p: any) => p.package_id);
        const { data: pkgMeta } = await supabase
          .from('packages')
          .select('id, name, class_credits, expire_days')
          .in('id', packageIds);

        packagesWithMeta = packagesData.map((up: any) => {
          const pkgInfo = pkgMeta?.find((p: any) => p.id === up.package_id);
          return { ...up, packages: pkgInfo };
        });
      }

      const classesThisMonth = bookings?.length || 0;
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const goalTarget = Math.ceil(daysInMonth * 0.8);
      const progressToGoal = Math.min((classesThisMonth / goalTarget) * 100, 100);

      const filteredPackages = packagesWithMeta
        .map((pkg: any) => {
          const packageMeta = pkg.packages || {};
          const expiryDate = pkg.expires_at ? new Date(pkg.expires_at) : new Date();
          const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          return {
            id: pkg.id,
            name: packageMeta.name || 'Package',
            classCreditsRemaining: pkg.class_credits_remaining || 0,
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

      setStats({
        classesThisMonth,
        progressToGoal,
        goalTarget,
        favoriteClass,
        favoriteCoach,
        activePackages,
      });
    } catch (err: any) {
      console.error('Dashboard stats error:', err.message);
      setError(`Failed to load dashboard stats: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-red-600 rounded-full mx-auto" />
          </div>
          <p className="text-white font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const TAB_CONFIG: { id: TabType; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Dumbbell },
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'packages', label: 'Packages', icon: ShoppingBag },
    { id: 'beverages', label: 'Beverages', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-red-950" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Navigation Bar */}
      <nav className="bg-black/60 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <span className="text-white font-black text-lg tracking-tight">JJ</span>
            <span className="text-red-600 font-black text-lg" style={{ textShadow: '0 0 8px #C41E3A' }}>STUDIO</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold uppercase tracking-wide flex items-center gap-2 transition text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-900/30 rounded-full p-2 mb-10 overflow-x-auto backdrop-blur border border-slate-700">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-6 py-3 rounded-full font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Email Verification Banner */}
        {!isEmailVerified && (
          <div className="mb-8 bg-amber-900/20 border border-amber-700/50 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-sm">
            <div className="flex items-start gap-4 flex-1">
              <Mail size={28} className="text-amber-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-white font-bold text-base mb-1">Verify your email to unlock full access</h3>
                <p className="text-amber-200 text-sm">Complete verification to access all packages and features.</p>
              </div>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold uppercase tracking-wide transition flex items-center gap-2 whitespace-nowrap text-sm"
            >
              {resendLoading ? '⏳ Sending...' : <>
                <Mail size={16} />
                Verify Now
              </>}
            </button>

            {verificationSent && (
              <div className="w-full sm:w-auto col-span-full p-3 bg-green-900/30 border border-green-700/50 rounded-lg flex items-center gap-2">
                <Check size={18} className="text-green-400 flex-shrink-0" />
                <p className="text-green-300 font-semibold text-sm">✓ Email sent! Check your inbox.</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-700/50 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-3 text-sm">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Welcome Section */}
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-2" style={{ letterSpacing: '0.02em' }}>
                Welcome back,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">
                  {user?.email?.split('@')[0]}
                </span>
              </h1>
              <p className="text-gray-400 text-lg">Here's your fitness summary for this month. Keep pushing! 💪</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-red-600/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">Classes This Month</p>
                    <p className="text-5xl font-black text-white">{stats.classesThisMonth}</p>
                  </div>
                  <BookOpen size={36} className="text-red-600/60" />
                </div>
                <p className="text-sm text-gray-400">
                  {Math.max(0, stats.goalTarget - stats.classesThisMonth)} more to reach your goal
                </p>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-red-600/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">Monthly Goal Progress</p>
                    <p className="text-5xl font-black text-white">{Math.round(stats.progressToGoal)}%</p>
                  </div>
                  <TrendingUp size={36} className="text-red-600/60" />
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mt-4">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-500"
                    style={{ width: `${stats.progressToGoal}%` }}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-red-600/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">Active Packages</p>
                    <p className="text-5xl font-black text-white">{stats.activePackages.length}</p>
                  </div>
                  <ShoppingBag size={36} className="text-red-600/60" />
                </div>
                <p className="text-sm text-gray-400">
                  {stats.activePackages[0]?.classCreditsRemaining || 0} credits available
                </p>
              </div>
            </div>

            {/* Favorites & Packages */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {stats.favoriteClass ? (
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-red-600/50 transition">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Your Favorite Class</h3>
                      <Award size={24} className="text-red-600" />
                    </div>
                    <p className="text-3xl font-black text-red-500 mb-2">{stats.favoriteClass.name}</p>
                    <p className="text-sm text-gray-400">
                      <span className="text-red-400 font-semibold">{stats.favoriteClass.count} times</span> this month
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 text-center">
                    <Award size={28} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold text-sm">Book classes to find your favorite</p>
                  </div>
                )}

                {stats.favoriteCoach ? (
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-red-600/50 transition">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Your Favorite Coach</h3>
                      <Users size={24} className="text-red-600" />
                    </div>
                    <p className="text-3xl font-black text-red-500 mb-2">{stats.favoriteCoach.name}</p>
                    <p className="text-sm text-gray-400">
                      Trained <span className="text-red-400 font-semibold">{stats.favoriteCoach.count} times</span> this month
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 text-center">
                    <Users size={28} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold text-sm">Book classes to find your favorite coach</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white">Your Active Packages</h2>
                  <button
                    onClick={() => setActiveTab('packages')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition"
                  >
                    <Plus size={18} />
                    Add Package
                  </button>
                </div>

                {stats.activePackages.length > 0 ? (
                  <div className="space-y-4">
                    {stats.activePackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`bg-gradient-to-r backdrop-blur border rounded-2xl p-5 transition ${
                          pkg.isNextToUse
                            ? 'from-green-900/30 to-green-900/10 border-green-600/50'
                            : pkg.expiresIn <= 3
                            ? 'from-amber-900/20 to-amber-900/10 border-amber-600/50'
                            : 'from-slate-800/50 to-slate-900/50 border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                              {pkg.isNextToUse && (
                                <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">ACTIVE</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-3">
                              {pkg.classCreditsRemaining === 999 ? '∞ Unlimited' : `${pkg.classCreditsRemaining} credits`}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} className={pkg.isNextToUse ? 'text-green-500' : pkg.expiresIn <= 3 ? 'text-amber-500' : 'text-gray-500'} />
                              <span className={pkg.isNextToUse ? 'text-green-400' : pkg.expiresIn <= 3 ? 'text-amber-400' : 'text-gray-400'}>
                                Expires in {pkg.expiresIn} days
                              </span>
                            </div>
                          </div>
                          <Zap size={24} className={pkg.isNextToUse ? 'text-green-500' : 'text-red-600'} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8 text-center">
                    <ShoppingBag size={36} className="text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">No active packages</h3>
                    <p className="text-gray-400 text-sm mb-4">Get a package to start booking classes.</p>
                    <button
                      onClick={() => setActiveTab('packages')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold text-sm transition"
                    >
                      Browse Packages
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Class Categories */}
            <div>
              <h2 className="text-2xl font-black text-white mb-6">Browse Classes by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {CLASS_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab('classes')}
                    className={`${category.color} hover:shadow-lg hover:shadow-red-600/50 hover:scale-105 text-white font-bold py-6 px-4 rounded-xl transition transform text-center`}
                  >
                    <p className="text-sm font-black">{category.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-black text-white mb-2">My Classes</h1>
              <p className="text-gray-400">Book and manage your fitness classes</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-12 text-center">
              <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Classes Management</h3>
              <p className="text-gray-400 text-sm">Navigate to the classes page for detailed bookings and scheduling.</p>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-black text-white mb-2">My Bookings</h1>
              <p className="text-gray-400">View and manage your class bookings</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-12 text-center">
              <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">Bookings</h3>
              <p className="text-gray-400 text-sm">Your upcoming classes and attendance history will appear here.</p>
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-black text-white mb-2">Packages</h1>
              <p className="text-gray-400">Choose the perfect membership for your fitness goals</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-red-600/50 transition">
                  <h3 className="text-xl font-black text-white mb-2">Package {i}</h3>
                  <p className="text-3xl font-black text-red-500 mb-4">${i * 20}</p>
                  <ul className="space-y-2 mb-6 text-gray-400 text-sm">
                    <li>✓ {i * 10} classes/month</li>
                    <li>✓ Unlimited access</li>
                    <li>✓ Priority booking</li>
                  </ul>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition">
                    Select Package
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'beverages' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-black text-white mb-2">Beverages</h1>
              <p className="text-gray-400">Refresh yourself with our premium selection</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Protein Shake', 'Energy Drink', 'Detox Water'].map((name, i) => (
                <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-8 hover:border-red-600/50 transition text-center">
                  <h3 className="text-xl font-black text-white mb-4">{name}</h3>
                  <p className="text-2xl font-black text-red-500 mb-4">${5 + i}</p>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl transition">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
