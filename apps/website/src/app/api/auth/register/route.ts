import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createSessionJWT, getProfileById } from '@agroconnect/shared';
import { SignJWT } from 'jose';

const SESSION_COOKIE = 'agroconnect_session';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone, role } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and full name are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
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

    const { id: userId } = await registerUser(email, password, full_name, phone, role);

    const jwt = await createSessionJWT({
      id: userId,
      email,
      role: role || 'buyer',
      full_name,
    });

    const profile = await getProfileById(userId);

    let emailSent = false;
    try {
      await sendVerificationEmail(email, userId);
      emailSent = true;
    } catch (e) {
      emailSent = false;
    }

    const response = NextResponse.json({
      success: true,
      message: emailSent ? 'Account created. Please check your email to verify.' : 'Account created, but verification email could not be sent.',
      email_sent: emailSent,
      user: {
        id: userId,
        email,
        full_name,
        phone,
        role: role || 'buyer',
        status: profile?.status || 'active',
        is_email_verified: false,
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
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Registration failed. Please try again.' },
      { status: 500 },
    );
  }
}

async function sendVerificationEmail(email: string, userId: string) {
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured');
  }

  const verifyToken = await new SignJWT({ sub: userId, purpose: 'email-verify' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  const verifyUrl = `${APP_URL}/verify-email?token=${verifyToken}`;

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: 'agroconnectgh8@gmail.com', name: 'AgroConnect GH' },
      subject: 'Verify your AgroConnect account',
      content: [{
        type: 'text/html',
        value: `<h2>Welcome to AgroConnect GH!</h2>
<p>Please verify your email by clicking the link below:</p>
<a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#047857;color:white;text-decoration:none;border-radius:6px;">Verify Email</a>
<p>Or copy this link: ${verifyUrl}</p>`,
      }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendGrid error ${res.status}: ${body}`);
  }
}
