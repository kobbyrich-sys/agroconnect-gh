import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getSessionToken, verifySessionJWT, getProfileById } from '@agroconnect/shared';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

export async function POST() {
  try {
    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifySessionJWT(token);
    if (!payload?.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const profile = await getProfileById(payload.sub);
    if (profile?.is_email_verified) {
      return NextResponse.json({ message: 'Your email is already verified.' });
    }

    if (!SENDGRID_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const verifyToken = await new SignJWT({ sub: payload.sub, purpose: 'email-verify' })
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
        personalizations: [{ to: [{ email: payload.email }] }],
        from: { email: 'agroconnectgh8@gmail.com', name: 'AgroConnect GH' },
        subject: 'Verify your AgroConnect account',
        content: [{
          type: 'text/html',
          value: `<h2>Verify your email</h2>
<p>Click the link below to verify your AgroConnect account:</p>
<a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#047857;color:white;text-decoration:none;border-radius:6px;">Verify Email</a>
<p>Or copy this link: ${verifyUrl}</p>`,
        }],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: `Failed to send: ${res.status}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Verification email sent. Please check your inbox.' });
  } catch {
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }
}
