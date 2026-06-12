
'use client';

import React, { ReactNode } from 'react';

/**
 * Minimal Auth Provider wrapper
 * 
 * This provider can be expanded later if you need global auth context,
 * but for now it just wraps children so the import doesn't fail.
 * 
 * Usage in layout.tsx:
 * import AuthProvider from '@/providers/AuthProvider'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <AuthProvider>
 *       {children}
 *     </AuthProvider>
 *   )
 * }
 */

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
