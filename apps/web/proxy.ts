import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "furlogs-session";

// Always allow the configured API URL (baked in at build time via NEXT_PUBLIC_API_URL)
// plus the canonical production domain. Using the env var instead of NODE_ENV means
// `next start` in CI (NODE_ENV=production, API_URL=localhost) still gets the right origin.
const apiUrlSet = new Set<string>([
  "https://api.furlogs.reno-is.dev",
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.furlogs.reno-is.dev",
]);
const API_ORIGINS = [...apiUrlSet].join(" ");

const isDev = process.env.NODE_ENV === "development";

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // strict-dynamic allows nonce-tagged scripts to load further scripts
    // (required for Next.js chunk loading). unsafe-eval is dev-only for
    // React error overlays and stack reconstruction.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${API_ORIGINS}`,
    `connect-src 'self' ${API_ORIGINS}`,
    "font-src 'self' data:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const { pathname, searchParams } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Forward nonce to server components (Next.js applies it to framework scripts automatically)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  function nextWithCsp(): NextResponse {
    // Set CSP on request headers so Next.js server components can read it,
    // and on response headers so the browser enforces it.
    const csp = buildCsp(nonce);
    requestHeaders.set("Content-Security-Policy", csp);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  // Session expired: clear stale cookie and let user reach /login
  if (pathname === "/login" && searchParams.has("expired")) {
    const response = nextWithCsp();
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Unauthenticated users hitting dashboard routes → /login
  const dashboardRoutes = [
    "/dashboard",
    "/onboarding",
    "/pets",
    "/vet-visits",
    "/vaccinations",
    "/medications",
    "/stock",
    "/calendar",
    "/spending",
    "/weight-history",
    "/household",
    "/notifications",
    "/settings",
  ];
  if (
    dashboardRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  ) {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      if (searchParams.has("verified")) {
        loginUrl.searchParams.set("verified", "1");
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // Authenticated users hitting auth routes → /pets
  // /verify-email is excluded: users are logged in right after registration but still need to verify
  // /two-factor-challenge is excluded: session cookie is set before 2FA is completed
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password"
  ) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/pets", request.url));
    }
  }

  return nextWithCsp();
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
