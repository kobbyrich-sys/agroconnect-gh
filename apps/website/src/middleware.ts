import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
const protectedPrefixes = ['/dashboard', '/seller', '/admin', '/profile', '/orders', '/cart', '/checkout', '/messages', '/wishlist', '/notifications', '/sell'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  const isAuthPage = authRoutes.some((route) => pathname === route || pathname.startsWith(route));
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth/callback|images/).*)',
  ],
};
