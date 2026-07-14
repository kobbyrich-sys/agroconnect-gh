import { NextResponse } from 'next/server';
import { verifySessionJWT, getSessionToken, getProfileById } from '@agroconnect/shared';

export async function GET() {
  try {
    const token = await getSessionToken();

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifySessionJWT(token);

    if (!payload || !payload.sub) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const profile = await getProfileById(payload.sub);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.sub,
        email: payload.email,
        full_name: payload.user_metadata?.full_name || profile?.full_name,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        role: profile?.role || payload.role,
        status: profile?.status || 'active',
        is_email_verified: profile?.is_email_verified || false,
        is_phone_verified: profile?.is_phone_verified || false,
        created_at: profile?.created_at,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
