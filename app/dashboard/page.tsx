// app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, LogOut, Loader, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/app/hooks/useAuth';

export default function DashboardPage() {
  const supabase = createClient();
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  const [trainers, setTrainers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: trainersData, error: trainersError } = await supabase
        .from('trainers')
        .select('id,hourly_rate,rating,total_sessions,users(full_name,avatar_url,bio)')
        .eq('is_available', true);

      if (trainersError) throw trainersError;
      setTrainers(trainersData ?? []);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('training_sessions')
        .select('id,title,scheduled_at,status,trainer_id')
        .eq('client_id', user!.id)
        .order('scheduled_at', { ascending: false });

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer || !bookingDate || !bookingTime) {
      setError('Please complete date/time and select a trainer');
      return;
    }
    try {
      setError(null);
      const scheduled_at = new Date(`${bookingDate}T${bookingTime}`).toISOString();
      const { error: bookingError } = await supabase.from('training_sessions').insert([
        {
          trainer_id: selectedTrainer,
          client_id: user!.id,
          title: 'Personal Training Session',
          scheduled_at,
        },
      ]);
      if (bookingError) throw bookingError;
      setSelectedTrainer(null);
      setBookingDate('');
      setBookingTime('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg,#000 0%,#1a0000 40%,#000 100%)' }}>
      <header className="bg-black border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Welcome, {userProfile?.first_name && userProfile?.last_name ? `${userProfile.first_name} ${userProfile.last_name}` : 'User'}</h1>
            <p className="text-sm text-white/50">Book sessions with our trainers</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="text-sm px-4 py-2 border border-white/10 rounded">Home</button>
            <button onClick={() => signOut()} className="flex items-center gap-2 px-4 py-2 bg-red-900 rounded text-white">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-white/5 border border-red-900/30 rounded flex items-center gap-3">
            <AlertCircle size={18} className="text-red-800" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-black">Available Trainers</h2>
            {trainers.length === 0 ? (
              <div className="p-6 bg-white/3 rounded">No trainers available</div>
            ) : (
              trainers.map((t) => (
                <div key={t.id} className="bg-white/3 p-5 rounded flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-black text-lg">{t.users?.full_name}</div>
                      <div className="text-xs px-2 py-1 border border-red-900/30 text-red-800 rounded">{t.rating} ★</div>
                    </div>
                    <div className="text-sm text-white/60 mt-2">{t.users?.bio}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black" style={{ color: '#800000' }}>${t.hourly_rate}/hr</div>
                    <button onClick={() => setSelectedTrainer(t.id)} className="mt-4 px-4 py-2 bg-red-900 rounded text-white text-sm">
                      Book
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <aside>
            {selectedTrainer && (
              <div className="bg-white/4 p-6 rounded mb-6">
                <h3 className="font-black mb-3">Book Session</h3>
                <form onSubmit={handleBooking} className="space-y-3">
                  <div>
                    <label className="text-xs text-white/60 block mb-1 uppercase">Date</label>
                    <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white" required />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1 uppercase">Time</label>
                    <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white" required />
                  </div>
                  <button type="submit" className="w-full py-2 bg-red-900 rounded text-white">Confirm Booking</button>
                  <button type="button" onClick={() => setSelectedTrainer(null)} className="w-full py-2 mt-2 border border-white/10 rounded text-white/60">Cancel</button>
                </form>
              </div>
            )}

            <div className="bg-white/4 p-6 rounded">
              <h3 className="font-black mb-3">Your Sessions</h3>
              {sessions.length === 0 ? (
                <p className="text-sm text-white/50">No sessions yet</p>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="p-3 bg-black/50 rounded mb-3 border border-white/6">
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-xs text-white/50">{new Date(s.scheduled_at).toLocaleString()}</div>
                    <div className="inline-block mt-2 px-2 py-1 text-xs rounded" style={{ backgroundColor: s.status === 'completed' ? '#0f5132' : s.status === 'cancelled' ? '#4b0000' : '#2b2b2b' }}>
                      {s.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}