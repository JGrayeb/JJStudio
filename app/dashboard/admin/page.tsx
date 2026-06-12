
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Activity, TrendingUp, LogOut, Loader, AlertCircle, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/app/hooks/useAuth';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface Stats {
  total_users: number;
  total_clients: number;
  total_trainers: number;
  total_sessions: number;
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const { user, userProfile, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_clients: 0,
    total_trainers: 0,
    total_sessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || userProfile?.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, userProfile, authLoading, router]);

  useEffect(() => {
    if (user && userProfile?.role === 'admin') {
      loadData();
    }
  }, [user, userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id,email,first_name,last_name,role,created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData ?? []);

      // Load sessions count
      const { count: sessionsCount, error: sessionsError } = await supabase
        .from('training_sessions')
        .select('id', { count: 'exact', head: true });

      if (sessionsError) throw sessionsError;

      const clients = usersData?.filter(u => u.role === 'client').length ?? 0;
      const trainers = usersData?.filter(u => u.role === 'trainer').length ?? 0;

      setStats({
        total_users: usersData?.length ?? 0,
        total_clients: clients,
        total_trainers: trainers,
        total_sessions: sessionsCount ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setError(null);
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
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
    <div className="min-h-screen bg-black text-white" style={{ background: 'linear-gradient(135deg,#000 0%,#1a0000 40%,#000 100%)' }}>
      <header className="bg-black border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Admin Dashboard</h1>
            <p className="text-sm text-white/50">System overview and management</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/')} className="text-sm px-4 py-2 border border-white/10 rounded hover:border-white/30">Home</button>
            <button onClick={() => signOut()} className="flex items-center gap-2 px-4 py-2 bg-red-900 rounded text-white hover:bg-red-800">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 p-6 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest">Total Users</p>
                <p className="text-3xl font-black mt-2">{stats.total_users}</p>
              </div>
              <Users size={32} className="text-white/20" />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest">Clients</p>
                <p className="text-3xl font-black mt-2">{stats.total_clients}</p>
              </div>
              <Activity size={32} className="text-white/20" />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest">Trainers</p>
                <p className="text-3xl font-black mt-2">{stats.total_trainers}</p>
              </div>
              <TrendingUp size={32} className="text-white/20" />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest">Sessions</p>
                <p className="text-3xl font-black mt-2">{stats.total_sessions}</p>
              </div>
              <Activity size={32} className="text-white/20" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/3 border border-white/10 rounded p-6">
          <h2 className="text-xl font-black mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs text-white/60 uppercase tracking-widest">Name</th>
                  <th className="text-left py-3 px-4 text-xs text-white/60 uppercase tracking-widest">Email</th>
                  <th className="text-left py-3 px-4 text-xs text-white/60 uppercase tracking-widest">Role</th>
                  <th className="text-left py-3 px-4 text-xs text-white/60 uppercase tracking-widest">Joined</th>
                  <th className="text-left py-3 px-4 text-xs text-white/60 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/3">
                    <td className="py-3 px-4">{u.first_name} {u.last_name}</td>
                    <td className="py-3 px-4 text-white/60">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: u.role === 'admin' ? '#4b0000' : u.role === 'trainer' ? '#2b2b2b' : '#0f2b0f' }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/60">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-red-600 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
