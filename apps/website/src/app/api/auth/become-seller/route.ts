import { NextRequest, NextResponse } from 'next/server';
import { verifySessionJWT, getSessionToken, grantUserRole, createSessionJWT, getProfileById, audit } from '@agroconnect/shared';

const SESSION_COOKIE = 'agroconnect_session';

export async function POST() {
  try {
    const token = await getSessionToken();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifySessionJWT(token);

    if (!payload || !payload.sub) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const profile = await getProfileById(payload.sub);

    const ok = await grantUserRole(payload.sub, 'seller');
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Failed to grant seller role' }, { status: 500 });
    }

    const roles = [...((payload.roles as string[]) || []), 'seller'];
    const active_role = 'seller';

    const jwt = await createSessionJWT({
      id: payload.sub, email: payload.email, role: 'authenticated',
      roles, active_role, full_name: profile?.full_name,
    });

    const response = NextResponse.json({
      success: true, message: 'Seller account created!',
      user: { id: payload.sub, email: payload.email, roles, active_role },
    });

    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 2592000,
    });

    audit('become-seller', { userId: payload.sub });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'Use POST' }, { status: 405 });
}
