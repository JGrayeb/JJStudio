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

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const { supabase, response } = createClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  const isPublicRoute =
    publicRoutes.has(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/images/") ||
    // Public media must bypass session checks; otherwise a <video> request
    // gets redirected to /login instead of receiving the MP4 stream.
    pathname.startsWith("/videos/");

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
