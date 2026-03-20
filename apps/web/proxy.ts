import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "furlog-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Unauthenticated users hitting dashboard routes → /login
  const dashboardRoutes = [
    "/dashboard",
    "/onboarding",
    "/pets",
    "/vet-visits",
    "/vaccinations",
    "/stock",
    "/calendar",
    "/spending",
    "/weight-history",
    "/household",
    "/notifications",
  ];
  if (
    dashboardRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  ) {
    if (!hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Authenticated users hitting auth routes → /pets
  // /verify-email is excluded: users are logged in right after registration but still need to verify
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password"
  ) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/pets", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
