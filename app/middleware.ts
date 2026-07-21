// app/middleware.ts
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages and assets must stay available to visitors and search engines.
  const publicRoutes = new Set([
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/password-reset',
    '/horarios',
    '/metodo-lagree',
    '/sobre-nosotros',
    '/classes',
    '/beverages',
    '/robots.txt',
    '/sitemap.xml',
    '/opengraph-image',
  ]);

  const isPublicRoute =
    publicRoutes.has(pathname) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/images/');

  // Skip middleware for admin routes (handle separately in /middleware.ts if needed)
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Avoid a Supabase session round trip for normal public pages, crawlers, and assets.
  if (isPublicRoute && !['/login', '/signup'].includes(pathname)) {
    return NextResponse.next();
  }

  // Get user session from cookies (more reliable than getUser())
  const supabase = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is logged in AND trying to access public routes → redirect to dashboard
  if (session && ['/login', '/signup'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is NOT logged in AND trying to access protected routes → redirect to login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
