import { NextRequest, NextResponse } from 'next/server';
import { verifySessionJWT } from '@agroconnect/shared/edge';

const COOKIE_NAME = 'agroconnect_session';

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/auth'];
const buyerRoutes = ['/cart', '/checkout', '/orders'];
const sellerRoutes = ['/sell', '/dashboard', '/products/manage', '/analytics', '/finance'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/'),
  );
  const isAdminRoute = pathname.startsWith('/admin');
  const isBuyerRoute = buyerRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/'),
  );
  const isSellerRoute = sellerRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/'),
  );
  const isPortalRoute = pathname.startsWith('/portal');
  const isProfileRoute = pathname.startsWith('/profile');
  const isWalletRoute = pathname.startsWith('/wallet');
  const isMessagesRoute = pathname.startsWith('/messages');

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifySessionJWT(token) : null;
  let authenticated = !!payload;

  if (authenticated && payload?.token_valid_since && payload.iat) {
    if (payload.iat < payload.token_valid_since) {
      authenticated = false;
    }
  }

  // Public + auth routes always accessible
  if (isPublic) {
    if (authenticated && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Admin routes require admin role
  if (isAdminRoute) {
    const roles = (payload?.roles as string[]) || [];
    const profileRole = (payload?.user_metadata?.role as string) || '';
    const isAdmin = roles.includes('admin') || roles.includes('super_admin') ||
      profileRole === 'admin' || profileRole === 'super_admin';
    if (!isAdmin) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  // Buyer-only routes
  if (isBuyerRoute) {
    const roles = (payload?.roles as string[]) || [];
    if (!roles.includes('buyer')) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  // Seller-only routes
  if (isSellerRoute) {
    const roles = (payload?.roles as string[]) || [];
    if (!roles.includes('seller')) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  // Portal routes require authentication
  if (isPortalRoute) return NextResponse.next();

  // Protected routes (require auth, no role restriction)
  const protectedRoutes = ['/dashboard', '/profile', '/orders', '/messages', '/wallet'];
  const isProtected = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/'),
  );
  if (isProtected) return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
