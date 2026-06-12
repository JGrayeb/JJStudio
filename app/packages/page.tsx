
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, AlertCircle, Check, Zap, Coffee } from 'lucide-react';

type Package = {
  id: string;
  name: string;
  class_credits: number;
  expire_days: number;  
  price_mxn: number;  
  beverage_credits: number; 
};

export default function PackagesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);
        await fetchPackages();
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load packages');
        setLoading(false);
      }
    };

    getUser();
  }, [router, supabase]);

  const fetchPackages = async () => {
    try {
        const { data, error: fetchError } = await supabase
          .from('packages')
         .select('*')
          .eq('active', true)  // ✅ Only fetch active packages
          .order('class_credits', { ascending: true });

     if (fetchError) throw fetchError;
        setPackages(data || []);
  } catch (err) {
    console.error('Fetch error:', err);
    setError('Failed to fetch packages');
  }
};

  const handlePurchasePackage = async (packageId: string) => {
  try {
    setPurchasingId(packageId);
    setError(null);

    // ✅ Fetch the package to get class_credits
    const { data: packageData, error: fetchError } = await supabase
      .from('packages')
      .select('class_credits')
      .eq('id', packageId)
      .single();

    if (fetchError || !packageData) throw new Error('Package not found');

    const { error: insertError } = await supabase
      .from('user_packages')
      .insert([
        {
          user_id: user.id,
          package_id: packageId,
          created_at: new Date().toISOString(),
          class_credits_remaining: packageData.class_credits, // ✅ Set remaining credits
        },
      ]);

    if (insertError) throw insertError;

    alert('✅ Package purchased successfully!');
    router.push('/dashboard/client');
  } catch (err) {
    console.error('Purchase error:', err);
    setError(`Failed to purchase package: ${err.message}`);
  } finally {
    setPurchasingId(null);
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
          <p className="text-white font-bold">Loading packages...</p>
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
          <h1 className="text-5xl font-black text-white mb-2" style={{ fontWeight: 800, letterSpacing: '0.08em' }}>CHOOSE YOUR PACKAGE</h1>
          <div className="h-1.5 w-20 bg-gradient-to-r from-red-800 via-red-600 to-red-500" style={{ boxShadow: '0 0 10px #C41E3A' }} />
          <p className="text-gray-400 mt-4 font-semibold">Unlock your training journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border-2 border-red-700 text-red-200 p-4 rounded-lg mb-8 flex items-center gap-3">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        )}

        {/* Packages Grid */}
        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`relative bg-black border-2 rounded-lg p-6 transition transform hover:scale-105 flex flex-col ${
                  index === 1
                    ? 'border-red-500 ring-2 ring-red-600/50'
                    : 'border-red-700'
                }`}
                style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}
              >
                {/* Popular Badge */}
                {index === 2 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Most Popular
                  </div>
                )}

                {/* Package Name */}
                <h2 className="text-2xl font-black text-white mb-2">{pkg.name}</h2>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-red-600">${pkg.price_mxn.toLocaleString('es-MX')}</span>
                  <span className="text-gray-400 font-bold text-sm">MXN</span>
                </div>

                {/* Details */}
                <div className="space-y-3 flex-1 mb-6">
                  {/* Class Credits */}
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-red-600" />
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold">Class Credits</p>
                      <p className="text-xl font-black text-white">
                        {pkg.class_credits === 999 ? '∞ Unlimited' : pkg.class_credits}
                      </p>
                    </div>
                  </div>

                  {/* Expiration */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                    <Check size={18} className="text-green-500" />
                    <p className="text-sm text-gray-300">
                      Valid for <span className="font-bold text-white">{pkg.expire_days} days</span>
                    </p>
                  </div>

                  {/* Price Per Class */}
                  {pkg.class_credits !== 999 && (
                    <div className="flex items-center gap-2">
                      <Check size={18} className="text-green-500" />
                      <p className="text-sm text-gray-300">
                        <span className="font-bold text-white">${(pkg.price_mxn / pkg.class_credits).toLocaleString('es-MX', { maximumFractionDigits: 0 })}</span> per class
                      </p>
                    </div>
                  )}

                  {/* Beverage Points */}
                  {pkg.beverage_credits > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                      <Coffee size={18} className="text-orange-500" />
                      <p className="text-sm text-gray-300">
                        <span className="font-bold text-white">{pkg.beverage_credits}</span> Beverage Points
                      </p>
                    </div>
                  )}
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchasePackage(pkg.id)}
                  disabled={purchasingId === pkg.id}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 px-4 rounded uppercase tracking-wide transition text-sm"
                  style={{ boxShadow: '0 0 15px rgba(196, 30, 58, 0.3)' }}
                >
                  {purchasingId === pkg.id ? 'Processing...' : 'Get This Package'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black border-2 border-red-700 rounded-lg p-8 text-center mb-12">
            <p className="text-gray-400">No packages available</p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-black border-2 border-red-700 rounded-lg p-8" style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}>
          <h3 className="text-2xl font-black text-white mb-6">WHY JJSTUDIO?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-bold text-red-600 mb-2">Premium Equipment</h4>
              <p className="text-gray-400">Train on state-of-the-art Megaformer machines designed for maximum results.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-600 mb-2">Expert Coaches</h4>
              <p className="text-gray-400">Learn from certified instructors dedicated to your fitness goals.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-600 mb-2">Flexibility</h4>
              <p className="text-gray-400">Book classes on your schedule and pause packages whenever needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
