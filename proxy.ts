import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const publicRoutes = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/password-reset",
  "/horarios",
  "/metodo-lagree",
  "/sobre-nosotros",
  "/classes",
  "/beverages",
  "/robots.txt",
  "/sitemap.xml",
  "/opengraph-image",
]);

const guestOnlyRoutes = new Set(["/login", "/signup"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The administration area has its own login flow and access rules.
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isPublicRoute =
    publicRoutes.has(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/images/");

  // Avoid a session round trip for public marketing pages and search crawlers.
  if (isPublicRoute && !guestOnlyRoutes.has(pathname)) {
    return NextResponse.next();
  }

  const { supabase, response } = createClient(request);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session && guestOnlyRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
