import { NextResponse } from 'next/server';
import { verifySessionJWT, getSessionToken, getProfileById, getTokenValidity, getUserRoles, createCsrfToken } from '@agroconnect/shared';

const CSRF_COOKIE = 'agroconnect_csrf';

export async function GET() {
  try {
    const token = await getSessionToken();

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifySessionJWT(token);

    if (!payload || !payload.sub || !payload.iat) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const tokenValidSince = await getTokenValidity(payload.sub);

    if (tokenValidSince) {
      const validSinceEpoch = Math.floor(new Date(tokenValidSince).getTime() / 1000);
      if (payload.iat < validSinceEpoch) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
    }

    const profile = await getProfileById(payload.sub);
    const roles = payload.roles?.length ? payload.roles : (profile ? await getUserRoles(payload.sub) : ['buyer']);
    const active_role = payload.active_role || roles[0] || 'buyer';

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: payload.sub,
        email: payload.email,
        full_name: payload.user_metadata?.full_name || profile?.full_name,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        role: profile?.role || payload.role,
        roles,
        active_role,
        status: profile?.status || 'active',
        is_email_verified: profile?.is_email_verified || false,
        is_phone_verified: profile?.is_phone_verified || false,
        created_at: profile?.created_at,
      },
    });

    const csrfToken = await createCsrfToken();
    response.cookies.set(CSRF_COOKIE, csrfToken, {
      httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 3600,
    });

    return response;
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
