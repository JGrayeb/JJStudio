
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  LogOut, BookOpen, Calendar, ShoppingBag, Zap, Mail, AlertCircle, 
  MessageCircle, Heart, X, CheckCircle, Loader, AlertTriangle
} from 'lucide-react';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

type Coach = {
  id: string;
  name: string;
  email: string;
};

type Class = {
  id: string;
  name: string;
  focus: string;
  date: string;
  hour: number;
  capacity: number;
  spots_remaining: number;
  coach_id: string;
  coaches?: Coach[] | null;
  coach_name?: string;
};

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
    beveragePoints: number;
    expiresIn: number;
    expiryDate: string;
    isNextToUse: boolean;
  }>;
};

type TabType = 'dashboard' | 'book' | 'bookings' | 'packages';

type Package = {
  id: string;
  name: string;
  class_credits: number;
  beverage_credits: number;
  price_mxn: number;
  expire_days: number;
  active?: boolean;
  created_at?: string;
};

type BookingResult = {
  success: boolean;
  message: string;
  creditsRemaining?: number;
};

type ErrorModalState = {
  isOpen: boolean;
  title: string;
  message: string;
  isDuplicateBooking: boolean;
};

// ============================================================
// COMPONENT
// ============================================================

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // State: Auth & UI
  const [user, setUser] = useState<any>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);

  // State: Data
  const [stats, setStats] = useState<UserStats>({
    classesThisMonth: 0,
    progressToGoal: 0,
    goalTarget: 0,
    favoriteClass: null,
    favoriteCoach: null,
    activePackages: [],
  });

  // State: Packages
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // State: Class Booking
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [bookedMegaformers, setBookedMegaformers] = useState<number[]>([]);
  const [megaformerState, setMegaformerState] = useState<{
    [key: number]: boolean;
  }>({});
  const [classPoints, setClassPoints] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);

  // State: Error Modal
  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    isOpen: false,
    title: '',
    message: '',
    isDuplicateBooking: false,
  });

  // State: Payment Modal
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    package: Package | null;
  }>({ isOpen: false, package: null });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ============================================================
  // INITIALIZATION
  // ============================================================

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

        await fetchPackages();
        await fetchDashboardStats(user.id);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase]);

  // ============================================================
  // FETCH PACKAGES FROM DATABASE
  // ============================================================

  const fetchPackages = async () => {
    try {
      setPackagesLoading(true);
      const { data, error: fetchError } = await supabase
        .from('packages')
        .select('id, name, class_credits, beverage_credits, price_mxn, expire_days, active')
        .eq('active', true)
        .order('price_mxn', { ascending: true });

      if (fetchError) throw fetchError;
      setPackages(data || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setPackagesLoading(false);
    }
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================

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
        .select('id, expires_at, class_credits_remaining, beverage_points, package_id')
        .eq('user_id', userId);

      let packagesWithMeta: any[] = [];
      if (packagesData?.length > 0) {
        const packageIds = packagesData.map((p: any) => p.package_id);
        const { data: pkgMeta } = await supabase
          .from('packages')
          .select('id, name')
          .in('id', packageIds);

        packagesWithMeta = packagesData
          .map((up: any) => {
            const pkgInfo = pkgMeta?.find((p: any) => p.id === up.package_id);
            const expiryDate = new Date(up.expires_at);
            const daysRemaining = Math.ceil(
              (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
              id: up.id,
              name: pkgInfo?.name || 'Package',
              classCreditsRemaining: up.class_credits_remaining || 0,
              beveragePoints: up.beverage_points || 0,
              expiresIn: daysRemaining,
              expiryDate: expiryDate.toLocaleDateString(),
              isNextToUse: false,
              isExpired: daysRemaining <= 0,
            };
          })
          .filter((p: any) => !p.isExpired && p.classCreditsRemaining > 0)
          .sort((a: any, b: any) => a.expiresIn - b.expiresIn);
      }

      const activePackages = packagesWithMeta.map((p: any, i: number) => ({
        ...p,
        isNextToUse: i === 0,
      }));

      const classesThisMonth = bookings?.length || 0;
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();
      const goalTarget = Math.ceil(daysInMonth * 0.8);

      const totalCredits = activePackages.reduce(
        (sum: number, p: any) => sum + p.classCreditsRemaining,
        0
      );
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

  // ============================================================
  // FETCH CLASSES & BOOKED MEGAFORMERS (NEW!)
  // ============================================================

  const fetchClasses = async (userId: string, date: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          focus,
          date,
          hour,
          capacity,
          spots_remaining,
          coach_id,
          coaches(
            id,
            name,
            email
          )
        `)
        .eq('date', date)
        .gt('spots_remaining', 0)
        .order('hour', { ascending: true });

      if (fetchError) throw fetchError;

      const formatted = data?.map((cls: any) => ({
        ...cls,
        coach_name: cls.coaches?.[0]?.name || 'Unassigned',
      })) || [];

      setClasses(formatted);
    } catch (err) {
      console.error('Classes fetch error:', err);
    }
  };

  // ✅ NEW: Fetch booked megaformers for a specific class
  const fetchBookedMegaformers = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from('class_bookings')
        .select('user_id')
        .eq('class_id', classId)
        .eq('user_id', user.id);

      if (error) throw error;

      // If user already has a booking for this class, return all megaformers (user can't book multiple)
      if (data && data.length > 0) {
        setBookedMegaformers([1, 2, 3, 4, 5, 6, 7]); // Mark all as unavailable
      } else {
        setBookedMegaformers([]); // No booking, all available
      }
    } catch (err) {
      console.error('Error fetching booked megaformers:', err);
    }
  };

  // ============================================================
  // CLASS BOOKING (IMPROVED!)
  // ============================================================

  const handleSelectClass = async (cls: Class) => {
    setSelectedClass(cls);
    setMegaformerState(
      Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((i) => [i, false]))
    );
    await fetchBookedMegaformers(cls.id); // ✅ Fetch booked megaformers
  };

  const handleBookClass = async () => {
    if (!selectedClass || !user || classPoints <= 0) {
      setErrorModal({
        isOpen: true,
        title: 'Invalid Booking',
        message: 'Please make sure you have available credits and a class selected.',
        isDuplicateBooking: false,
      });
      return;
    }

    const selectedMegaformers = Object.entries(megaformerState)
      .filter(([_, selected]) => selected)
      .map(([num]) => parseInt(num));

    if (selectedMegaformers.length === 0) {
      setErrorModal({
        isOpen: true,
        title: 'No Equipment Selected',
        message: 'Please select at least one megaformer to book this class.',
        isDuplicateBooking: false,
      });
      return;
    }

    try {
      setBookingLoading(true);

      const { data, error: rpcError } = await supabase.rpc(
        'book_class_and_deduct_credits',
        {
          p_user_id: user.id,
          p_class_id: selectedClass.id,
          p_megaformer_ids: selectedMegaformers,
        }
      );

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        throw new Error(rpcError.message || 'Booking failed');
      }

      if (!data?.success) {
        // ✅ Check if it's a duplicate booking error
        const isDuplicate = data?.message?.toLowerCase().includes('already have');
        
        setErrorModal({
          isOpen: true,
          title: isDuplicate ? 'Already Booked' : 'Booking Failed',
          message: isDuplicate 
            ? 'You already have a megaformer in this class. Each user can only book one equipment per class.'
            : (data?.message || 'Your booking could not be completed. Please try again.'),
          isDuplicateBooking: isDuplicate,
        });
        return;
      }

      // ✅ Success! Show success message and reset
      setErrorModal({
        isOpen: true,
        title: 'Booking Successful! ✅',
        message: `${data.message}\n\n${data.creditsRemaining} credits remaining`,
        isDuplicateBooking: false,
      });

      setSelectedClass(null);
      setMegaformerState({});
      setBookedMegaformers([]);
      await fetchDashboardStats(user.id);
    } catch (err) {
      console.error('Booking error:', err);
      setErrorModal({
        isOpen: true,
        title: 'Booking Error',
        message: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
        isDuplicateBooking: false,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // ============================================================
  // PACKAGE PURCHASE
  // ============================================================

  const handlePackagePurchase = (pkg: Package) => {
    setPaymentModal({ isOpen: true, package: pkg });
    setPaymentSuccess(false);
  };

  const simulatePayment = async () => {
    if (!paymentModal.package || !user) return;

    setPaymentLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const { data, error: rpcError } = await supabase.rpc(
        'purchase_package',
        {
          p_user_id: user.id,
          p_package_id: paymentModal.package.id,
          p_class_credits: paymentModal.package.class_credits,
          p_beverage_credits: paymentModal.package.beverage_credits,
          p_expiration_days: paymentModal.package.expire_days,
        }
      );

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        throw new Error(rpcError.message || 'Purchase failed');
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Purchase failed');
      }

      setPaymentSuccess(true);

      setTimeout(async () => {
        await fetchDashboardStats(user.id);
        setPaymentModal({ isOpen: false, package: null });
        setPaymentSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Purchase error:', err);
      setErrorModal({
        isOpen: true,
        title: 'Purchase Failed',
        message: err instanceof Error ? err.message : 'Your purchase could not be completed.',
        isDuplicateBooking: false,
      });
      setPaymentLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-red-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const dateObj = new Date(selectedDate);
  const dateString = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-red-950"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      {/* NAVIGATION */}
      <nav className="fixed inset-x-0 top-0 z-50 h-16 bg-black/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-white font-black text-lg">JJ</span>
              <span className="text-red-600 font-black text-lg ml-0.5">
                STUDIO
              </span>
            </div>

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

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {!isEmailVerified && (
            <div className="mb-6 bg-amber-900/20 border border-amber-700 rounded-xl p-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-amber-500" />
                <span className="text-amber-200">
                  Verify your email to unlock full access
                </span>
              </div>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1 rounded-lg font-bold text-xs">
                Verify Now
              </button>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl font-black text-white mb-2">
                  Welcome back,{' '}
                  <span className="text-red-500">
                    {user?.email?.split('@')[0]}
                  </span>
                </h1>
                <p className="text-gray-400">
                  Here's your fitness summary for this month
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-600/50 transition">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">
                    Classes This Month
                  </p>
                  <p className="text-4xl font-black text-white mb-2">
                    {stats.classesThisMonth}
                  </p>
                  <p className="text-sm text-gray-400">
                    {Math.max(0, stats.goalTarget - stats.classesThisMonth)}{' '}
                    more to reach goal
                  </p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-600/50 transition">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">
                    Monthly Progress
                  </p>
                  <p className="text-4xl font-black text-white mb-2">
                    {Math.round(stats.progressToGoal)}%
                  </p>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-red-600 h-full rounded-full"
                      style={{ width: `${stats.progressToGoal}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-600/50 transition">
                  <p className="text-gray-400 text-xs font-bold uppercase mb-2">
                    Active Packages
                  </p>
                  <p className="text-4xl font-black text-white mb-2">
                    {stats.activePackages.length}
                  </p>
                  <p className="text-sm text-gray-400">
                    {classPoints} credits available
                  </p>
                </div>
              </div>

              {stats.activePackages.length > 0 && (
                <div>
                  <h2 className="text-2xl font-black text-white mb-4">
                    Your Active Packages
                  </h2>
                  <div className="space-y-3">
                    {stats.activePackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-white font-bold">{pkg.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">
                              {pkg.classCreditsRemaining} credits • Expires in{' '}
                              {pkg.expiresIn} days
                              {pkg.beveragePoints > 0 && (
                                <span className="text-green-400 ml-2">
                                  • {pkg.beveragePoints} beverage points
                                </span>
                              )}
                            </p>
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

          {/* BOOK CLASS TAB */}
          {activeTab === 'book' && (
            <div className="space-y-6" id="book-class">
              <h1 className="text-4xl font-black text-white">Book Your Class</h1>

              {classPoints <= 0 && (
                <div className="bg-amber-900/20 border border-amber-700 rounded-xl p-4 text-amber-200">
                  You don't have class points.{' '}
                  <button
                    onClick={() => setActiveTab('packages')}
                    className="text-red-400 font-bold underline"
                  >
                    Get a package
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Classes List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">
                      Selected Date
                    </p>
                    <p className="text-3xl font-black text-white">
                      {dateString}
                    </p>
                  </div>

                  {classes.length > 0 ? (
                    classes.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => handleSelectClass(cls)}
                        className={`bg-slate-800/50 border-2 rounded-xl p-4 cursor-pointer transition ${
                          selectedClass?.id === cls.id
                            ? 'border-red-600 bg-red-600/10'
                            : 'border-slate-700 hover:border-red-600'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-black text-white">
                              {cls.name}
                            </h3>
                            <p className="text-red-400 font-bold text-sm">
                              {cls.focus}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                              Coach: {cls.coach_name}
                            </p>
                          </div>
                          <div className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold">
                            {cls.hour}:00
                          </div>
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
                    <h3 className="text-xl font-black text-white mb-4">
                      Select Equipment
                    </h3>

                    {bookedMegaformers.length > 0 && (
                      <div className="mb-4 bg-amber-900/30 border border-amber-700 rounded-lg p-3">
                        <p className="text-amber-200 text-sm font-bold">
                          ⚠️ You already have a booking for this class
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 mb-6">
                      <div className="bg-gray-600 h-6 rounded flex items-center justify-center text-xs font-bold text-black">
                        MIRROR
                      </div>

                      <div className="flex justify-center gap-3">
                        {[1, 2].map((n) => (
                          <button
                            key={n}
                            onClick={() =>
                              !bookedMegaformers.includes(n) &&
                              setMegaformerState({
                                ...megaformerState,
                                [n]: !megaformerState[n],
                              })
                            }
                            disabled={bookedMegaformers.includes(n)}
                            className={`w-16 h-16 rounded-lg font-black transition ${
                              bookedMegaformers.includes(n)
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                : megaformerState[n]
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
                            onClick={() =>
                              !bookedMegaformers.includes(n) &&
                              setMegaformerState({
                                ...megaformerState,
                                [n]: !megaformerState[n],
                              })
                            }
                            disabled={bookedMegaformers.includes(n)}
                            className={`w-14 h-14 rounded-lg font-bold transition ${
                              bookedMegaformers.includes(n)
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                : megaformerState[n]
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
                      <p className="text-gray-400">
                        Selected:{' '}
                        <span className="text-red-400 font-bold">
                          {
                            Object.values(megaformerState).filter((v) => v)
                              .length
                          }
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={handleBookClass}
                      disabled={
                        bookingLoading ||
                        Object.values(megaformerState).every((v) => !v) ||
                        classPoints <= 0 ||
                        bookedMegaformers.length > 0
                      }
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
                    >
                      {bookingLoading ? 'Booking...' : `Book (${classPoints})`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h1 className="text-4xl font-black text-white">My Bookings</h1>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                <Calendar size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  Your bookings will appear here
                </p>
              </div>
            </div>
          )}

          {/* PACKAGES TAB */}
          {activeTab === 'packages' && (
            <div className="space-y-8" id="packages">
              <div>
                <h1 className="text-4xl font-black text-white">
                  Choose Your Package
                </h1>
                <p className="text-gray-400 mt-2">
                  Select the perfect plan for your fitness goals
                </p>
              </div>

              {packagesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-12 h-12 border-4 border-slate-700 border-t-red-600 rounded-full animate-spin" />
                </div>
              ) : packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {packages.map((pkg) => {
                    const isPopular = pkg.name.toLowerCase().includes('unlimited');
                    
                    return (
                      <div
                        key={pkg.id}
                        className={`bg-slate-800/50 border-2 border-slate-700 rounded-xl p-6 relative hover:shadow-xl hover:shadow-red-600/20 transition ${
                          isPopular ? 'ring-2 ring-red-600 scale-105' : ''
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 rounded-bl-lg font-bold text-xs">
                            POPULAR
                          </div>
                        )}

                        <h3 className="text-lg font-black text-white mb-1">
                          {pkg.name}
                        </h3>
                        <p className="text-3xl font-black text-red-600 mb-1">
                          ${pkg.price_mxn.toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-xs uppercase mb-4 font-bold">
                          {pkg.class_credits === 999
                            ? 'Unlimited'
                            : `${pkg.class_credits} Classes`}
                        </p>

                        <div className="space-y-2 mb-4 text-xs text-gray-300">
                          <p>✓ Expires in {pkg.expire_days} days</p>
                          {pkg.beverage_credits > 0 && (
                            <p className="text-green-400 font-bold">
                              ✓ +{pkg.beverage_credits} Beverage Points
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handlePackagePurchase(pkg)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition text-sm"
                        >
                          Get Package
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center text-gray-400">
                  No packages available
                </div>
              )}

              <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 mt-8">
                <h3 className="text-xl font-black text-white mb-4">
                  Contact JJ Studio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-400 uppercase font-bold mb-1">
                      Phone
                    </p>
                    <a
                      href="tel:+5213318373447"
                      className="text-red-500 hover:text-red-400 font-bold"
                    >
                      +52 1 33 1837 3447
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase font-bold mb-1">
                      Address
                    </p>
                    <p className="text-gray-300">
                      Xentric Lomas Norte, El Campanario, Lcl 211
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

{/* NAVIGATION */}
<nav className="fixed inset-x-0 top-0 z-50 h-16 bg-black/80 backdrop-blur-lg border-b border-slate-800">
  <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      {/* JJ STUDIO LOGO - NOT CLICKABLE */}
      <div>
        <span className="text-white font-black text-lg">JJ</span>
        <span className="text-red-600 font-black text-lg ml-0.5">
          STUDIO
        </span>
      </div>

      <div className="h-10 w-px bg-slate-700" />

      {/* INSTAGRAM ICON */}
      <a
        href="https://www.instagram.com/jj_lagree_experience?igsh=MThwanZrcXg5ZnZ6dg=="
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-slate-800 transition text-gray-400 hover:text-pink-500"
        title="Follow us on Instagram"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <circle cx="17.5" cy="6.5" r="1.5" />
        </svg>
      </a>

      {/* WHATSAPP ICON */}
      <a
        href="https://wa.me/5213318373447?text=Hola%20JJ%20Studio"
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-slate-800 transition text-gray-400 hover:text-green-500"
        title="Contact us on WhatsApp"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </a>
    </div>

    {/* REST OF NAVBAR STAYS THE SAME */}
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

    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2"
    >
      <LogOut size={16} /> Logout
    </button>
  </div>
</nav>




      {/* ✅ ERROR MODAL (NEW!) */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-center mb-4">
              {errorModal.isDuplicateBooking ? (
                <AlertTriangle size={48} className="text-amber-500" />
              ) : errorModal.title.includes('Successful') ? (
                <CheckCircle size={48} className="text-green-500" />
              ) : (
                <AlertCircle size={48} className="text-red-500" />
              )}
            </div>

            <h2 className="text-2xl font-black text-white text-center mb-2">
              {errorModal.title}
            </h2>

            <p className="text-gray-400 text-center text-sm mb-6 whitespace-pre-wrap">
              {errorModal.message}
            </p>

            <button
              onClick={() =>
                setErrorModal({
                  isOpen: false,
                  title: '',
                  message: '',
                  isDuplicateBooking: false,
                })
              }
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {paymentModal.isOpen && paymentModal.package && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() =>
                !paymentLoading &&
                setPaymentModal({ isOpen: false, package: null })
              }
              disabled={paymentLoading}
              className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:opacity-50"
            >
              <X size={24} />
            </button>

            {!paymentSuccess ? (
              <>
                <h2 className="text-2xl font-black text-white mb-2">
                  Complete Your Purchase
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Confirm your package purchase
                </p>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold">Package</span>
                    <span className="text-white font-black">
                      {paymentModal.package.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold">Amount</span>
                    <span className="text-red-500 font-black text-lg">
                      ${paymentModal.package.price_mxn.toLocaleString()} MXN
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-bold">Credits</span>
                    <span className="text-green-400 font-black">
                      {paymentModal.package.class_credits === 999
                        ? 'Unlimited'
                        : paymentModal.package.class_credits}
                    </span>
                  </div>
                  {paymentModal.package.beverage_credits > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-bold">
                        Beverage Points
                      </span>
                      <span className="text-green-400 font-black">
                        +{paymentModal.package.beverage_credits}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={simulatePayment}
                  disabled={paymentLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {paymentLoading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} />
                      Confirm Purchase
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  💳 This is a simulated payment for development purposes
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="mb-4 animate-bounce">
                    <CheckCircle size={64} className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">
                    Payment Successful! ✅
                  </h3>
                  <p className="text-gray-400 text-center text-sm mb-4">
                    Your {paymentModal.package.name} package has been added to
                    your account
                  </p>
                  <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 w-full text-center">
                    <p className="text-green-400 font-bold text-sm">
                      +
                      {paymentModal.package.class_credits === 999
                        ? '∞'
                        : paymentModal.package.class_credits}{' '}
                      Credits Added
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}