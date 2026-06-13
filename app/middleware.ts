// app/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ['/login', '/signup', '/'];

  // Skip middleware for admin routes (handle separately in /middleware.ts if needed)
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Get user session from cookies (more reliable than getUser())
  const supabase = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is logged in AND trying to access public routes → redirect to dashboard
  if (session && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is NOT logged in AND trying to access protected routes → redirect to login
  if (!session && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};