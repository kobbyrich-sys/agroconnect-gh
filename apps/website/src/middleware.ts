import { NextRequest, NextResponse } from 'next/server';
import { verifySessionJWT } from '@agroconnect/shared/edge';

const COOKIE_NAME = 'agroconnect_session';

const publicRoutes = [
  '/', '/marketplace', '/categories', '/about', '/contact',
  '/search', '/products', '/api',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/'),
  );
  const isAuthRoute = pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/auth/');
  const isAdminRoute = pathname.startsWith('/admin');
  const isPortalRoute = pathname.startsWith('/portal');

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifySessionJWT(token) : null;
  let authenticated = !!payload;

  // Check server-side session invalidation (token_valid_since) from JWT payload
  if (authenticated && payload?.token_valid_since && payload.iat) {
    if (payload.iat < payload.token_valid_since) {
      authenticated = false;
    }
  }

  // Allow public and auth routes for everyone
  if (isPublic || isAuthRoute) {
    // If authenticated and on login/register/forgot-password/auth, redirect to dashboard
    if (authenticated && (
      pathname === '/login' ||
      pathname === '/register' ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/auth/')
    )) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Admin routes require authentication
  if (isAdminRoute) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const isAdmin = payload?.user_metadata?.role === 'admin' ||
      payload?.user_metadata?.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Portal routes require authentication
  if (isPortalRoute) {
    if (!authenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/orders', '/messages', '/sell'];
  const isProtected = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/'),
  );

  if (isProtected && !authenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
