import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, getProfileById, createSessionJWT } from '@agroconnect/shared';

const SESSION_COOKIE = 'agroconnect_session';

// In-memory rate limiter (per email). For production, replace with Vercel KV / Redis.
const attempts = new Map<string, { count: number; last: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

function isRateLimited(email: string): { limited: boolean; retryAfter?: number } {
  const key = email.toLowerCase().trim();
  const record = attempts.get(key);
  const now = Date.now();

  if (!record) return { limited: false };

  if (now - record.last > WINDOW_MS) {
    attempts.delete(key);
    return { limited: false };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.last + LOCKOUT_MS - now) / 1000);
    return { limited: true, retryAfter: retryAfter > 0 ? retryAfter : 60 };
  }

  return { limited: false };
}

function recordAttempt(email: string, success: boolean) {
  const key = email.toLowerCase().trim();
  if (success) {
    attempts.delete(key);
    return;
  }
  const now = Date.now();
  const record = attempts.get(key);
  if (record && now - record.last < WINDOW_MS) {
    record.count += 1;
    record.last = now;
  } else {
    attempts.set(key, { count: 1, last: now });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, remember_me } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const { limited, retryAfter } = isRateLimited(email);
    if (limited) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Try again in ${retryAfter} seconds.`, retry_after: retryAfter },
        { status: 429 },
      );
    }

    const user = await verifyPassword(email, password);

    if (!user) {
      recordAttempt(email, false);
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

    recordAttempt(email, true);

    const profile = await getProfileById(user.user_id);

    const remember = remember_me === true;
    const expiresIn = remember ? '30d' : '1d';

    const jwt = await createSessionJWT({
      id: user.user_id,
      email: user.user_email,
      role: user.user_role,
      full_name: profile?.full_name,
    }, { expiresIn, tokenValidSince: profile?.token_valid_since });

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
      session: { access_token: jwt, expires_at: Math.floor(Date.now() / 1000) + (remember ? 2592000 : 86400) },
    });

    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: remember ? 2592000 : 86400,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 },
    );
  }
}
