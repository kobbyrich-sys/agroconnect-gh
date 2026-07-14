import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createSessionJWT, getProfileById, setEmailVerified, getUserByEmail } from '@agroconnect/shared';

const SESSION_COOKIE = 'agroconnect_session';

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('a number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('a special character');
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone, role } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and full name are required' },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 },
      );
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Password must contain ' + passwordErrors.join(', ') },
        { status: 400 },
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'If this email is not already registered, an account has been created.',
      }, { status: 201 });
    }

    const { id: userId } = await registerUser(email, password, full_name, phone, role);

    await setEmailVerified(userId);

    const jwt = await createSessionJWT({
      id: userId,
      email,
      role: role || 'buyer',
      full_name,
    });

    const profile = await getProfileById(userId);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: userId,
        email,
        full_name,
        phone,
        role: role || 'buyer',
        status: profile?.status || 'active',
        is_email_verified: true,
        is_phone_verified: false,
        created_at: profile?.created_at || new Date().toISOString(),
      },
      session: { access_token: jwt, expires_at: Math.floor(Date.now() / 1000) + 604800 },
    }, { status: 201 });

    response.cookies.set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return response;
  } catch (error: any) {
    if (error?.message?.includes('duplicate') || error?.message?.includes('already')) {
      return NextResponse.json({
        success: true,
        message: 'If this email is not already registered, an account has been created.',
      }, { status: 201 });
    }
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 },
    );
  }
}
