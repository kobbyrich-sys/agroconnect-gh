import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, getProfileById, createSessionJWT, getUserRoles, verifyCsrfToken, RateLimiter, audit } from '@agroconnect/shared';

const SESSION_COOKIE = 'agroconnect_session';
const CSRF_COOKIE = 'agroconnect_csrf';

const loginLimiter = new RateLimiter(5, 15 * 60 * 1000);
const csrfExemptPaths = ['/api/auth/login', '/api/auth/register'];

function validate(input: { email?: string; password?: string }): string | null {
  if (!input.email || !input.password) return 'Email and password are required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return 'Invalid email format';
  if (input.password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationError = validate(body);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const { email, password, remember_me } = body;

    const { allowed, retryAfter } = loginLimiter.check(email);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Try again in ${retryAfter} seconds.`, retry_after: retryAfter },
        { status: 429 },
      );
    }

    const user = await verifyPassword(email, password);

    if (!user) {
      loginLimiter.increment(email);
      audit('login.failed', { email });
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.user_status === 'suspended' || user.user_status === 'inactive') {
      audit('login.blocked', { email, status: user.user_status });
      return NextResponse.json({ success: false, error: 'Account is suspended. Please contact support.' }, { status: 403 });
    }

    loginLimiter.reset(email);

    const profile = await getProfileById(user.user_id);
    const roles = user.user_roles?.length ? user.user_roles : ['buyer'];
    const active_role = roles[0];
    const remember = remember_me === true;

    const jwt = await createSessionJWT({
      id: user.user_id,
      email: user.user_email,
      role: user.user_role,
      roles,
      active_role,
      full_name: profile?.full_name,
    }, { expiresIn: remember ? '30d' : '1d', tokenValidSince: profile?.token_valid_since });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.user_id,
        email: user.user_email,
        full_name: profile?.full_name,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        role: user.user_role,
        roles,
        active_role,
        status: user.user_status,
        is_email_verified: profile?.is_email_verified || false,
        is_phone_verified: profile?.is_phone_verified || false,
        created_at: profile?.created_at,
      },
      session: { access_token: jwt, expires_at: Math.floor(Date.now() / 1000) + (remember ? 2592000 : 86400) },
    });

    const maxAge = remember ? 2592000 : 86400;
    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge,
    });

    audit('login.success', { email, userId: user.user_id });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
