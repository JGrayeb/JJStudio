
'use client';

import React from 'react';
import { createClient } from '@/utils/supabase/client';

type Partner = {
  id: string;
  name: string;
  publicUrl: string;
  supportsIframe?: boolean;
  description?: string;
};

const PARTNERS: Partner[] = [
  { 
    id: 'nessty', 
    name: 'Nessty', 
    publicUrl: 'https://nessty.mx/@jjstudio', 
    supportsIframe: true, 
    description: 'Book directly from Nessty without leaving the site.' 
  },
  { 
    id: 'fitpass', 
    name: 'Fitpass', 
    publicUrl: 'https://fitpass.example.com', 
    supportsIframe: false, 
    description: 'Access fitness classes and gyms through Fitpass.' 
  },
  { 
    id: 'totalpass', 
    name: 'Totalpass', 
    publicUrl: 'https://totalpass.example.com', 
    supportsIframe: false, 
    description: 'Book classes with your Totalpass membership.' 
  },
  { 
    id: 'wellhub', 
    name: 'Wellhub', 
    publicUrl: 'https://wellhub.example.com', 
    supportsIframe: false, 
    description: 'Reserve your spot through Wellhub wellness platform.' 
  },
];

export default function ExternalBookings({ userId }: { userId?: string | null }) {
  const supabase = createClient();

  const trackPartnerClick = async (partnerId: string) => {
    try {
      await supabase.from('partner_clicks').insert({
        partner_id: partnerId,
        user_id: userId || null,
        clicked_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('trackPartnerClick error', err);
    }
  };

  const openInNewTab = async (p: Partner) => {
    await trackPartnerClick(p.id);
    const url = `${p.publicUrl}${p.publicUrl.includes('?') ? '&' : '?'}utm_source=jjstudio&utm_medium=partner&utm_campaign=booking_${p.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="mt-12 mb-12">
      <h2 className="text-2xl font-black text-white mb-6 uppercase">Book with External Apps</h2>

      {/* Nessty iframe block */}
      <div className="mb-8 bg-black border-2 border-red-700 rounded-lg overflow-hidden" style={{ boxShadow: '0 0 20px rgba(196, 30, 58, 0.2)' }}>
        <div className="px-6 py-4 flex items-center justify-between bg-black/60 border-b border-red-700">
          <div>
            <h3 className="text-xl font-black text-white">Book with Nessty</h3>
            <p className="text-gray-400 text-sm">Reserve directly from Nessty without leaving our site.</p>
          </div>
          <button
            onClick={() => openInNewTab(PARTNERS[0])}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold uppercase text-sm transition"
          >
            Open in new tab
          </button>
        </div>

        {/* Iframe (responsive) */}
        <div style={{ width: '100%', height: 700 }}>
          <iframe
            src={PARTNERS[0].publicUrl}
            title="Nessty Booking"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="payment; fullscreen; clipboard-write"
          />
        </div>

        <div className="px-6 py-3 bg-black/60 border-t border-red-700 text-gray-300 text-sm">
          💡 If the booking widget doesn't load properly, click "Open in new tab" above.
        </div>
      </div>

      {/* Other partners - cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PARTNERS.slice(1).map((p) => (
          <div 
            key={p.id} 
            className="bg-black border-2 border-red-700 rounded-lg p-6 hover:border-red-500 transition" 
            style={{ boxShadow: '0 0 12px rgba(196,30,58,0.12)' }}
          >
            <h4 className="text-lg font-black text-white mb-2">{p.name}</h4>
            <p className="text-gray-400 mb-4 text-sm">{p.description || `Open ${p.name} to book.`}</p>
            <button
              onClick={() => openInNewTab(p)}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold uppercase text-sm transition"
            >
              Open {p.name}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}