
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of public routes (anyone can access)
  const publicRoutes = ['/login', '/signup', '/'];

  // Check if user is authenticated
  const supabase = createClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in AND trying to access public routes → redirect to dashboard
  if (user && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is NOT logged in AND trying to access protected routes → redirect to login
  if (!user && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
