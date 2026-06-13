
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, AlertCircle, X, Trash2 } from 'lucide-react';
import ExternalBookings from '../components/ExternalBookings';

type Booking = {
  id: string;
  class_id: string;
  class_name: string;
  focus: string;
  date: string;
  hour: number;
  coach_name: string;
  megaformer_id: number;
  signed_up_at: string;
  attended: boolean;
};

export default function BookingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);
        await fetchBookings(user.id);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load bookings');
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase]);

  const fetchBookings = async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('class_bookings')
        .select('id, class_id, megaformer_id, signed_up_at, attended, classes(name, focus, date, hour, coaches(name))')
        .eq('user_id', userId)
        .order('signed_up_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedBookings = data?.map((booking: any) => ({
        id: booking.id,
        class_id: booking.class_id,
        class_name: booking.classes?.name || 'Unknown Class',
        focus: booking.classes?.focus || '',
        date: booking.classes?.date || '',
        hour: booking.classes?.hour || 0,
        coach_name: booking.classes?.coaches?.name || 'Unknown Coach',
        megaformer_id: booking.megaformer_id,
        signed_up_at: booking.signed_up_at,
        attended: booking.attended,
      })) || [];

      setBookings(formattedBookings);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch bookings');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setCancellingId(bookingId);

      const { error: deleteError } = await supabase
        .from('class_bookings')
        .delete()
        .eq('id', bookingId);

      if (deleteError) throw deleteError;

      setBookings(bookings.filter(b => b.id !== bookingId));
      setError(null);
    } catch (err) {
      console.error('Cancel error:', err);
      setError('Failed to cancel booking');
    } finally {
      setCancellingId(null);
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
          <p className="text-white font-bold">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(`${b.date}T${b.hour}:00`) > now);
  const pastBookings = bookings.filter(b => new Date(`${b.date}T${b.hour}:00`) <= now);

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
          <h1 className="text-5xl font-black text-white mb-2" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>MY BOOKINGS</h1>
          <div className="h-1.5 w-20 bg-gradient-to-r from-red-800 via-red-600 to-red-500" style={{ boxShadow: '0 0 10px #C41E3A' }} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border-2 border-red-700 text-red-200 p-4 rounded-lg mb-8 flex items-center gap-3">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

        {/* Upcoming Bookings */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-white mb-6 uppercase">Upcoming Classes</h2>
          {upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-black border-2 border-red-700 rounded-lg p-6"
                  style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-white">{booking.class_name}</h3>
                      <p className="text-red-400 font-bold">{booking.focus}</p>
                    </div>
                    <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">
                      {booking.hour}:00
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-gray-400 text-sm">
                      Date: <span className="text-white font-bold">{new Date(booking.date).toLocaleDateString()}</span>
                    </p>
                    <p className="text-gray-400 text-sm">
                      Coach: <span className="text-white font-bold">{booking.coach_name}</span>
                    </p>
                    <p className="text-gray-400 text-sm">
                      Megaformer: <span className="text-red-400 font-bold">#{booking.megaformer_id}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded uppercase tracking-wide flex items-center justify-center gap-2 transition text-sm"
                  >
                    <Trash2 size={16} />
                    {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-black border-2 border-red-700 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">No upcoming bookings</p>
              <button
                onClick={() => router.push('/classes')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold uppercase text-sm transition"
              >
                Book a Class
              </button>
            </div>
          )}
        </div>

        {/* External Bookings Section */}
        <ExternalBookings userId={user?.id} />

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6 uppercase">Past Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-black border-2 border-gray-700 rounded-lg p-6 opacity-75"
                  style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.1)' }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-gray-400">{booking.class_name}</h3>
                      <p className="text-gray-500 font-bold">{booking.focus}</p>
                    </div>
                    <span className={`px-3 py-1 rounded font-bold text-sm ${
                      booking.attended
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {booking.attended ? '✓ Attended' : 'Missed'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-500 text-sm">
                      Date: <span className="text-gray-300 font-bold">{new Date(booking.date).toLocaleDateString()}</span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      Coach: <span className="text-gray-300 font-bold">{booking.coach_name}</span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      Megaformer: <span className="text-gray-400 font-bold">#{booking.megaformer_id}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
