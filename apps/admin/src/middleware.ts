import { NextRequest, NextResponse } from 'next/server';
import { verifySessionJWT } from '@agroconnect/shared/edge';

const COOKIE_NAME = 'agroconnect_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminLogin = pathname === '/admin/login';

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifySessionJWT(token) : null;
  const authenticated = !!payload;

  if (isAdminLogin) {
    if (authenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
