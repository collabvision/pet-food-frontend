import { NextResponse } from 'next/server';

// The refresh cookie name must match what the backend sets.
const REFRESH_COOKIE_NAME = 'refreshToken';

// Routes only accessible when NOT logged in
const AUTH_ONLY_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Routes that require any logged-in user
const PROTECTED_ROUTES = ['/account', '/cart', '/checkout', '/order'];

// Routes that require ADMIN role — we redirect to /admin/login instead of /login
const ADMIN_ROUTES = ['/admin'];

// Admin login page — skip session check so admins can reach it
const ADMIN_LOGIN_PATH = '/admin/login';

export function middleware(request) {
  const hasSession = request.cookies.has(REFRESH_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  // Admin account: allow access
if (pathname === '/admin/account') {
  return NextResponse.next();
}

  // ── Admin login page: let through always (even if no session) ─────────────
  if (pathname === ADMIN_LOGIN_PATH) {
    // If already has a session cookie, let the client-side useEffect redirect
    return NextResponse.next();
  }

  // ── Admin account: allow access ─────────────────────────────────────
if (pathname === '/admin/account') {
  return NextResponse.next();
}

// ── Already signed in? Don't show auth-only screens ─────────────────
if (hasSession && AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
  return NextResponse.redirect(new URL('/', request.url));}
  // ── Already signed in? Don't show auth-only screens ──────────────────────
  if (hasSession && AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ── User-protected routes: redirect to /login ─────────────────────────────
  if (!hasSession && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  // ── Admin routes: redirect to /admin/login if no session ─────────────────
  // Note: role check (ADMIN vs USER) is done client-side in the AdminLayout
  // because the middleware can't decode the JWT — it only checks cookie presence.
  if (!hasSession && ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/account/:path*',
    '/admin/:path*',
    '/cart',
    '/checkout',
    '/order/:path*',
  ],
};
