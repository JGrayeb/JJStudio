
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, BookOpen, Calendar, ShoppingBag, Zap, Mail, AlertCircle, MessageCircle, Heart } from 'lucide-react';

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

type Class = {
  id: string;
  name: string;
  focus: string;
  date: string;
  hour: number;
  capacity: number;
  spots_remaining: number;
  coach_name: string;
};

type TabType = 'dashboard' | 'book' | 'bookings' | 'packages';

const PACKAGES = [
  {
    id: 1,
    name: '1 Class',
    price: 370,
    currency: 'MXN',
    classes: 1,
    expirationDays: 5,
    beveragePoints: 0,
    color: 'border-blue-600',
  },
  {
    id: 2,
    name: '10 Classes',
    price: 3300,
    currency: 'MXN',
    classes: 10,
    expirationDays: 14,
    beveragePoints: 0,
    color: 'border-yellow-600',
  },
  {
    id: 3,
    name: '24 Classes',
    price: 7200,
    currency: 'MXN',
    classes: 24,
    expirationDays: 30,
    beveragePoints: 0,
    color: 'border-purple-600',
  },
  {
    id: 4,
    name: 'Unlimited',
    price: 9999,
    currency: 'MXN',
    classes: '∞',
    expirationDays: 30,
    beveragePoints: 2,
    popular: true,
    color: 'border-red-600',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({
    classesThisMonth: 0,
    progressToGoal: 0,
    goalTarget: 0,
    favoriteClass: null,
    favoriteCoach: null,
    activePackages: [],
  });

  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [megaformerState, setMegaformerState] = useState<{ [key: number]: boolean }>({});
  const [classPoints, setClassPoints] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
        setIsEmailVerified(!!(
          user.user_metadata?.email_confirmed_at || 
          user.user_metadata?.email_verified ||
          user.confirmed_at
        ));
        
        await fetchDashboardStats(user.id);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load dashboard');
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase]);

  const fetchDashboardStats = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: bookings } = await supabase
        .from('class_bookings')
        .select('classes(id, name, focus)')
        .eq('user_id', userId)
        .gte('signed_up_at', monthStart.toISOString())
        .lte('signed_up_at', monthEnd.toISOString())
        .eq('attended', true);

      const { data: packagesData } = await supabase
        .from('user_packages')
        .select('id, expires_at, class_credits_remaining, package_id')
        .eq('user_id', userId);

      let packagesWithMeta: any[] = [];
      if (packagesData?.length > 0) {
        const packageIds = packagesData.map((p: any) => p.package_id);
        const { data: pkgMeta } = await supabase
          .from('packages')
          .select('id, name')
          .in('id', packageIds);

        packagesWithMeta = packagesData.map((up: any) => {
          const pkgInfo = pkgMeta?.find((p: any) => p.id === up.package_id);
          const expiryDate = new Date(up.expires_at);
          const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            id: up.id,
            name: pkgInfo?.name || 'Package',
            classCreditsRemaining: up.class_credits_remaining || 0,
            expiresIn: daysRemaining,
            expiryDate: expiryDate.toLocaleDateString(),
            isNextToUse: false,
            isExpired: daysRemaining <= 0,
          };
        })
        .filter((p: any) => !p.isExpired && p.classCreditsRemaining > 0)
        .sort((a: any, b: any) => a.expiresIn - b.expiresIn);
      }

      const activePackages = packagesWithMeta.map((p: any, i: number) => ({ ...p, isNextToUse: i === 0 }));
      const classesThisMonth = bookings?.length || 0;
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const goalTarget = Math.ceil(daysInMonth * 0.8);

      const totalCredits = activePackages.reduce((sum: number, p: any) => sum + p.classCreditsRemaining, 0);
      setClassPoints(totalCredits);

      const classCount = new Map<string, number>();
      bookings?.forEach((b: any) => {
        const name = b.classes?.name || 'Unknown';
        classCount.set(name, (classCount.get(name) || 0) + 1);
      });

      let favoriteClass = null;
      let maxCount = 0;
      classCount.forEach((count, name) => {
        if (count > maxCount) {
          maxCount = count;
          favoriteClass = { name, count };
        }
      });

      setStats({
        classesThisMonth,
        progressToGoal: Math.min((classesThisMonth / goalTarget) * 100, 100),
        goalTarget,
        favoriteClass,
        favoriteCoach: null,
        activePackages,
      });

      await fetchClasses(userId, selectedDate);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const fetchClasses = async (userId: string, date: string) => {
    try {
      const { data } = await supabase
        .from('classes')
        .select('*, coaches(name)')
        .eq('date', date)
        .gt('spots_remaining', 0)
        .order('hour', { ascending: true });

      const formatted = data?.map((cls: any) => ({
        ...cls,
        coach_name: cls.coaches?.name || 'Unknown',
      })) || [];

      setClasses(formatted);
    } catch (err) {
      console.error('Classes fetch error:', err);
    }
  };

  const handleBookClass = async () => {
    if (!selectedClass || !user || classPoints <= 0) return;

    const selectedMegaformers = Object.entries(megaformerState)
      .filter(([_, selected]) => selected)
      .map(([num]) => parseInt(num));

    if (selectedMegaformers.length === 0) {
      setError('Select at least one megaformer');
      return;
    }

    try {
      setBookingLoading(true);

      for (const megaformerId of selectedMegaformers) {
        await supabase.from('class_bookings').insert([{
          user_id: user.id,
          class_id: selectedClass.id,
          megaformer_id: megaformerId,
          signed_up_at: new Date().toISOString(),
          attended: false,
        }]);
      }

      setError(null);
      alert('✅ Class booked!');
      setSelectedClass(null);
      setMegaformerState({});
      await fetchDashboardStats(user.id);
    } catch (err) {
      setError('Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-red-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const dateObj = new Date(selectedDate);
  const dateString = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-red-950" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Fixed Navigation */}
      <nav className="fixed inset-x-0 top-0 z-50 h-16 bg-black/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          {/* Logo & Social Links */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-white font-black text-lg">JJ</span>
              <span className="text-red-600 font-black text-lg ml-0.5">STUDIO</span>
            </div>

            {/* Social Icons */}
            <div className="h-10 w-px bg-slate-700" />
            
            <a
              href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg=="
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-slate-800 transition text-gray-400 hover:text-pink-500"
              title="Follow us on Instagram"
            >
              <Heart size={20} />
            </a>

            <a
              href={`https://wa.me/5213318373447?text=Hola%20JJ%20Studio`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-slate-800 transition text-gray-400 hover:text-green-500"
              title="Contact us on WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          </div>

          {/* Nav Tabs - Distributed */}
          <div className="hidden lg:flex gap-4 flex-1 justify-center">
            {[
              { id: 'dashboard' as const, label: 'Dashboard' },
              { id: 'book' as const, label: 'Book Class' },
              { id: 'bookings' as const, label: 'My Bookings' },
              { id: 'packages' as const, label: 'Packages' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  activeTab === id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Email Verification */}
          {!isEmailVerified && (
            <div className="mb-6 bg-amber-900/20 border border-amber-700 rounded-xl p-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-amber-500" />
                <span className="text-amber-200">Verify your email to unlock full access</span>
              </div>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1 rounded-lg font-bold text-xs">
                Verify Now
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-700 rounded-xl p-4 flex items-center gap-3 text-sm text-red-200">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-black text-white mb-2">
                  Welcome back, <span className="text-red-500">{user?.email?.split('@')[0]}</span>
                </h1>
                <p className="text-gray-400">Here's your fitness summary for this month</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-600/50 transition">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">Classes This Month</p>
                  <p className="text-4xl font-black text-white mb-2">{stats.classesThisMonth}</p>
                  <p className="text-sm text-gray-400">{Math.max(0, stats.goalTarget - stats.classesThisMonth)} more to reach goal</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-600/50 transition">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">Monthly Progress</p>
                  <p className="text-4xl font-black text-white mb-2">{Math.round(stats.progressToGoal)}%</p>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-red-600 h-full rounded-full" style={{ width: `${stats.progressToGoal}%` }} />
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-600/50 transition">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">Active Packages</p>
                  <p className="text-4xl font-black text-white mb-2">{stats.activePackages.length}</p>
                  <p className="text-sm text-gray-400">{classPoints} credits available</p>
                </div>
              </div>

              {/* Active Packages */}
              {stats.activePackages.length > 0 && (
                <div>
                  <h2 className="text-2xl font-black text-white mb-4">Your Active Packages</h2>
                  <div className="space-y-3">
                    {stats.activePackages.map((pkg) => (
                      <div key={pkg.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-white font-bold">{pkg.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">{pkg.classCreditsRemaining} credits • Expires in {pkg.expiresIn} days</p>
                          </div>
                          <Zap className="text-red-600" size={24} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveTab('packages')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition text-lg"
              >
                + Add Package
              </button>
            </div>
          )}

          {/* Book Class Tab */}
          {activeTab === 'book' && (
            <div className="space-y-6">
              <h1 className="text-4xl font-black text-white">Book Your Class</h1>

              {classPoints <= 0 && (
                <div className="bg-amber-900/20 border border-amber-700 rounded-xl p-4 text-amber-200">
                  You don't have class points. <button onClick={() => setActiveTab('packages')} className="text-red-400 font-bold underline">Get a package</button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Classes List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Selected Date</p>
                    <p className="text-3xl font-black text-white">{dateString}</p>
                  </div>

                  {classes.length > 0 ? (
                    classes.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => {
                          setSelectedClass(cls);
                          setMegaformerState(Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map(i => [i, false])));
                        }}
                        className={`bg-slate-800/50 border-2 rounded-xl p-4 cursor-pointer transition ${
                          selectedClass?.id === cls.id
                            ? 'border-red-600 bg-red-600/10'
                            : 'border-slate-700 hover:border-red-600'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-black text-white">{cls.name}</h3>
                            <p className="text-red-400 font-bold text-sm">{cls.focus}</p>
                            <p className="text-gray-400 text-sm mt-2">Coach: {cls.coach_name}</p>
                          </div>
                          <div className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold">{cls.hour}:00</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center text-gray-400">
                      No classes available
                    </div>
                  )}
                </div>

                {/* Megaformer Selection */}
                {selectedClass && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-fit sticky top-24">
                    <h3 className="text-xl font-black text-white mb-4">Select Equipment</h3>

                    <div className="space-y-4 mb-6">
                      <div className="bg-gray-600 h-6 rounded flex items-center justify-center text-xs font-bold text-black">MIRROR</div>

                      <div className="flex justify-center gap-3">
                        {[1, 2].map((n) => (
                          <button
                            key={n}
                            onClick={() => setMegaformerState({...megaformerState, [n]: !megaformerState[n]})}
                            className={`w-16 h-16 rounded-lg font-black transition ${
                              megaformerState[n]
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-700 text-gray-400 hover:border-red-600'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-center gap-2">
                        {[3, 4, 5, 6, 7].map((n) => (
                          <button
                            key={n}
                            onClick={() => setMegaformerState({...megaformerState, [n]: !megaformerState[n]})}
                            className={`w-14 h-14 rounded-lg font-bold transition ${
                              megaformerState[n]
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-700 text-gray-400'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 mb-4 text-sm">
                      <p className="text-gray-400">Selected: <span className="text-red-400 font-bold">{Object.values(megaformerState).filter(Boolean).length}</span></p>
                    </div>

                    <button
                      onClick={handleBookClass}
                      disabled={bookingLoading || Object.values(megaformerState).every(v => !v) || classPoints <= 0}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
                    >
                      {bookingLoading ? 'Booking...' : `Book (${classPoints})`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h1 className="text-4xl font-black text-white">My Bookings</h1>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                <Calendar size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Your bookings will appear here</p>
              </div>
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black text-white">Choose Your Package</h1>
                <p className="text-gray-400 mt-2">Select the perfect plan for your fitness goals</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`bg-slate-800/50 border-2 ${pkg.color} rounded-xl p-6 relative hover:shadow-xl hover:shadow-red-600/20 transition ${
                      pkg.popular ? 'ring-2 ring-red-600 scale-105' : ''
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 rounded-bl-lg font-bold text-xs">
                        POPULAR
                      </div>
                    )}

                    <h3 className="text-lg font-black text-white mb-1">{pkg.name}</h3>
                    <p className="text-3xl font-black text-red-600 mb-1">${pkg.price.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs uppercase mb-4 font-bold">
                      {pkg.classes === '∞' ? 'Unlimited' : `${pkg.classes} Classes`}
                    </p>

                    <div className="space-y-2 mb-4 text-xs text-gray-300">
                      <p>✓ Expires in {pkg.expirationDays} days</p>
                      {pkg.beveragePoints > 0 && (
                        <p className="text-green-400 font-bold">✓ +{pkg.beveragePoints} Beverage Points</p>
                      )}
                    </div>

                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition text-sm">
                      Get Package
                    </button>
                  </div>
                ))}
              </div>

              {/* Company Info */}
              <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-black text-white mb-4">Contact JJ Studio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-400 uppercase font-bold mb-1">Phone</p>
                    <a href="tel:+5213318373447" className="text-red-500 hover:text-red-400 font-bold">
                      +52 1 33 1837 3447
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase font-bold mb-1">Address</p>
                    <p className="text-gray-300">Xentric Lomas Norte, El Campanario, Lcl 211</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}