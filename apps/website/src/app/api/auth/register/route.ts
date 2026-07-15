import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createSessionJWT, getProfileById, setEmailVerified, getUserByEmail, grantUserRole, RateLimiter, audit } from '@agroconnect/shared';

const SESSION_COOKIE = 'agroconnect_session';

const registerLimiter = new RateLimiter(3, 60 * 60 * 1000);

function validate(input: { email?: string; password?: string; full_name?: string }): string | null {
  if (!input.email || !input.password || !input.full_name) return 'Email, password, and full name are required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return 'Invalid email format';
  if (!['buyer', 'farmer'].includes(input.role || '')) return 'Role must be buyer or farmer';
  const pwErrors: string[] = [];
  if (input.password.length < 8) pwErrors.push('at least 8 characters');
  if (!/[A-Z]/.test(input.password)) pwErrors.push('an uppercase letter');
  if (!/[a-z]/.test(input.password)) pwErrors.push('a lowercase letter');
  if (!/[0-9]/.test(input.password)) pwErrors.push('a number');
  if (!/[^A-Za-z0-9]/.test(input.password)) pwErrors.push('a special character');
  if (pwErrors.length) return 'Password must contain ' + pwErrors.join(', ');
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationError = validate(body);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const { email, password, full_name, phone, role } = body;

    const { allowed, retryAfter } = registerLimiter.check(email);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Try again in ${retryAfter} seconds.`, retry_after: retryAfter },
        { status: 429 },
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
    }

    const { id: userId } = await registerUser(email, password, full_name, phone);
    registerLimiter.reset(email);

    await setEmailVerified(userId);

    const isFarmer = role === 'farmer';
    const roles = isFarmer ? ['buyer', 'seller'] : ['buyer'];
    const active_role = isFarmer ? 'seller' : 'buyer';

    if (isFarmer) {
      await grantUserRole(userId, 'seller');
    }

    const jwt = await createSessionJWT({
      id: userId, email, role: active_role, roles, active_role, full_name,
    });

    const profile = await getProfileById(userId);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: userId, email, full_name, phone, role: active_role, roles, active_role,
        status: profile?.status || 'active', is_email_verified: true, is_phone_verified: false,
        created_at: profile?.created_at || new Date().toISOString(),
      },
      session: { access_token: jwt, expires_at: Math.floor(Date.now() / 1000) + 604800 },
    }, { status: 201 });

    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 604800,
    });

    audit('register.success', { email, userId });
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
