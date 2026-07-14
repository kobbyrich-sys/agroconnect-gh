import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, getProfileById, createSessionJWT } from '@agroconnect/shared';

const SESSION_COOKIE = 'agroconnect_session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const user = await verifyPassword(email, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    if (user.user_status === 'suspended' || user.user_status === 'inactive') {
      return NextResponse.json(
        { success: false, error: 'Account is suspended. Please contact support.' },
        { status: 403 },
      );
    }

    const profile = await getProfileById(user.user_id);

    const jwt = await createSessionJWT({
      id: user.user_id,
      email: user.user_email,
      role: user.user_role,
      full_name: profile?.full_name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        email: user.user_email,
        full_name: profile?.full_name,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        role: user.user_role,
        status: user.user_status,
        is_email_verified: profile?.is_email_verified || false,
        is_phone_verified: profile?.is_phone_verified || false,
        created_at: profile?.created_at,
      },
      session: { access_token: jwt, expires_at: Math.floor(Date.now() / 1000) + 604800 },
    });

    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 },
    );
  }
}
