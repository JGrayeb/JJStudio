
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

type Class = {
  id: string;
  name: string;
  focus: string;
  date: string;
  hour: number;
  capacity: number;
  spots_remaining: number;
  coach_id: string;
  coach_name: string;
  coach_email: string;
};

type MegaformerState = {
  [key: number]: boolean; // true if booked
};

export default function ClassesBooking() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [megaformerState, setMegaformerState] = useState<MegaformerState>(
    { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false }
  );
  const [classPoints, setClassPoints] = useState(0);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);

        // Fetch class points
        const { data: packagesData } = await supabase
          .from('user_packages')
          .select('packages(class_credits)')
          .eq('user_id', user.id);

        const totalPoints = packagesData?.reduce((sum: number, pkg: any) => {
          return sum + (pkg.packages?.class_credits || 0);
        }, 0) || 0;
        setClassPoints(totalPoints);

        // Fetch classes for selected date
        await fetchClasses(user.id, new Date().toISOString().split('T')[0]);

        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load');
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase]);

  const fetchClasses = async (userId: string, date: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('classes')
        .select('*, coaches(id, name, email)')
        .eq('date', date)
        .gt('spots_remaining', 0)
        .order('hour', { ascending: true })
        .limit(7);

      if (fetchError) throw fetchError;

      const formattedClasses = data?.map((cls: any) => ({
        ...cls,
        coach_name: cls.coaches?.name || 'Unknown Coach',
        coach_email: cls.coaches?.email || '',
      })) || [];

      setClasses(formattedClasses);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedClass(null);
    setMegaformerState({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false });
    fetchClasses(user.id, newDate);
  };

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    handleDateChange(prev.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    handleDateChange(next.toISOString().split('T')[0]);
  };

  const handleMegaformerClick = (number: number) => {
    if (megaformerState[number]) {
      setMegaformerState({ ...megaformerState, [number]: false });
    } else {
      setMegaformerState({ ...megaformerState, [number]: true });
    }
  };

  const handleBookClass = async () => {
    if (!selectedClass || !user || classPoints <= 0) {
      if (classPoints <= 0) {
        router.push(' /packages');
      }
      return;
    }

    const selectedMegaformers = Object.entries(megaformerState)
      .filter(([_, selected]) => selected)
      .map(([num, _]) => parseInt(num));

    if (selectedMegaformers.length === 0) {
      setError('Please select a megaformer');
      return;
    }

    try {
      setBooking(true);

      // Create booking for each selected megaformer
      for (const megaformerId of selectedMegaformers) {
        const { error: bookError } = await supabase
          .from('class_bookings')
          .insert([
            {
              user_id: user.id,
              class_id: selectedClass.id,
              megaformer_id: megaformerId,
              signed_up_at: new Date().toISOString(),
              attended: false,
            },
          ]);

        if (bookError) throw bookError;
      }

      // Deduct class points
      const { error: updateError } = await supabase
        .from('user_packages')
        .update({ class_credits: classPoints - 1 })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setError(null);
      alert('Class booked successfully!');
      setSelectedClass(null);
      setMegaformerState({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false });
      setClassPoints(classPoints - 1);
      await fetchClasses(user.id, selectedDate);
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to book class');
    } finally {
      setBooking(false);
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
          <p className="text-white font-bold">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-red-950" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Navigation */}
      <nav className="bg-black border-b-2 border-red-700" style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">
              ← Back
            </button>
            <div>
              <span className="text-white font-black text-xl">JJ</span>
              <span className="text-red-600 font-black text-xl" style={{ textShadow: '0 0 8px #C41E3A' }}>STUDIO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-red-600 font-bold text-lg">
              Points: <span className="text-white">{classPoints}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold uppercase tracking-wide flex items-center gap-2 transition"
              style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.3)' }}
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-2" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>BOOK YOUR CLASS</h1>
          <div className="h-1.5 w-20 bg-gradient-to-r from-red-800 via-red-600 to-red-500" style={{ boxShadow: '0 0 10px #C41E3A' }} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border-2 border-red-700 text-red-200 p-4 rounded-lg mb-8 flex items-center gap-3">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

        {classPoints <= 0 && (
          <div className="bg-yellow-900 border-2 border-yellow-700 text-yellow-200 p-4 rounded-lg mb-8 flex items-center justify-between">
            <span>You don't have class points. <strong>Get a package first!</strong></span>
            <button
              onClick={() => router.push('/packages')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold uppercase text-sm transition"
            >
              View Packages
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Date Selector & Classes */}
          <div className="lg:col-span-2">
            {/* Date Navigation */}
            <div className="bg-black border-2 border-red-700 rounded-lg p-6 mb-6" style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevDay} className="text-gray-400 hover:text-red-600 transition">
                  <ChevronLeft size={32} />
                </button>
                <div className="text-center">
                  <p className="text-gray-400 text-sm uppercase font-bold">Selected Date</p>
                  <p className="text-2xl font-black text-white">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <button onClick={handleNextDay} className="text-gray-400 hover:text-red-600 transition">
                  <ChevronRight size={32} />
                </button>
              </div>
            </div>

            {/* Classes List */}
            <div className="space-y-4">
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`bg-black border-2 rounded-lg p-6 cursor-pointer transition transform ${
                      selectedClass?.id === cls.id
                        ? 'border-red-600 scale-105'
                        : 'border-red-700 hover:border-red-600'
                    }`}
                    style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black text-white">{cls.name}</h3>
                        <p className="text-red-400 font-bold">{cls.focus}</p>
                      </div>
                      <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">
                        {cls.hour}:00
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Coach: <span className="text-white font-bold">{cls.coach_name}</span></p>
                        <p className="text-gray-400 text-sm">Spots Available: <span className="text-red-400 font-bold">{cls.spots_remaining}/{cls.capacity}</span></p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-black border-2 border-red-700 rounded-lg p-6 text-center">
                  <p className="text-gray-400">No classes available for this date</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Megaformer Selection */}
          {selectedClass && (
            <div className="bg-black border-2 border-red-700 rounded-lg p-6" style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}>
              <h3 className="text-2xl font-black text-white mb-6">SELECT MEGAFORMER</h3>
              <p className="text-gray-400 text-sm mb-6 uppercase font-bold">Click to select your equipment</p>

              {/* Studio Diagram */}
              <div className="mb-8">
                {/* Mirror */}
                <div className="bg-gray-600 h-8 mb-6 rounded flex items-center justify-center">
                  <p className="text-black font-bold text-sm">← MIRROR →</p>
                </div>

                {/* First Row (1, 2) */}
                <div className="flex justify-center gap-6 mb-6">
                  {[1, 2].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleMegaformerClick(num)}
                      className={`w-16 h-16 rounded-lg font-black text-lg transition transform hover:scale-110 ${
                        megaformerState[num]
                          ? 'bg-red-600 text-white border-2 border-red-400'
                          : 'bg-gray-800 text-gray-400 border-2 border-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Second Row (3, 4, 5, 6, 7) */}
                <div className="flex justify-center gap-3">
                  {[3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleMegaformerClick(num)}
                      className={`w-14 h-14 rounded-lg font-black text-lg transition transform hover:scale-110 ${
                        megaformerState[num]
                          ? 'bg-red-600 text-white border-2 border-red-400'
                          : 'bg-gray-800 text-gray-400 border-2 border-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Details */}
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm uppercase font-bold mb-2">Booking Summary</p>
                <p className="text-white font-bold mb-1">{selectedClass.name}</p>
                <p className="text-red-400 text-sm mb-2">{new Date(selectedClass.date).toLocaleDateString()} at {selectedClass.hour}:00</p>
                <p className="text-gray-400 text-sm">
                  Selected: <span className="text-red-400 font-bold">
                    {Object.values(megaformerState).filter(Boolean).length} megaformer(s)
                  </span>
                </p>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookClass}
                disabled={booking || Object.values(megaformerState).every(v => !v)}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 px-4 rounded uppercase tracking-wide transition"
                style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.3)' }}
              >
                {booking ? 'Booking...' : 'Book Class'}
              </button>

              {classPoints <= 0 && (
                <button
                  onClick={() => router.push('/packages')}
                  className="w-full mt-3 bg-yellow-700 hover:bg-yellow-800 text-white font-bold py-3 px-4 rounded uppercase tracking-wide transition"
                >
                  Get Points
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
