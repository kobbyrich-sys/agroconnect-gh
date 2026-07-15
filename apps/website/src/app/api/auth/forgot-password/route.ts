import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, RateLimiter, audit } from '@agroconnect/shared';
import { SignJWT } from 'jose';

const RESET_SECRET = new TextEncoder().encode(
  (process.env.RESET_PASSWORD_SECRET || process.env.SUPABASE_JWT_SECRET)! + ':reset'
);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;

const forgotPwLimiter = new RateLimiter(1, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const { allowed } = forgotPwLimiter.check(email);
    if (!allowed) {
      return NextResponse.json({
        success: true, message: 'If an account exists, a password reset link has been sent.',
      });
    }

    forgotPwLimiter.increment(email);

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({
        success: true, message: 'If an account exists, a password reset link has been sent.',
      });
    }

    const token = await new SignJWT({ sub: user.user_id, email: user.user_email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(RESET_SECRET);

    const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: 'agroconnectgh8@gmail.com', name: 'AgroConnect GH' },
        subject: 'Reset your AgroConnect password',
        content: [{
          type: 'text/html',
          value: `<h2>Password Reset</h2>
<p>Click the link below to reset your password (expires in 1 hour):</p>
<a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#047857;color:white;text-decoration:none;border-radius:6px;">Reset Password</a>
<p>Or copy this link: ${resetUrl}</p>`,
        }],
      }),
    });

    audit('forgot-password.sent', { email, userId: user.user_id });
    return NextResponse.json({
      success: true, message: 'If an account exists, a password reset link has been sent.',
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
