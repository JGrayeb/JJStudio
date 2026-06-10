// app/components/BrandButton.tsx
'use client'
import React from 'react';

export default function BrandButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`py-2 px-4 rounded text-white font-bold tracking-widest uppercase text-xs ${className}`}
      style={{ backgroundColor: '#800000' }}
    >
      {children}
    </button>
  );
}