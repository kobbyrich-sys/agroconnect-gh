import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';
import { createHmac, randomBytes } from 'crypto';

function createResetToken(email: string): string {
  const exp = Date.now() + 3600000;
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString('base64url');
  const sig = createHmac('sha256', process.env.SUPABASE_JWT_SECRET!)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!users) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    }

    const token = createResetToken(email);
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    const sendgridRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: 'noreply@agroconnectgh.vercel.app', name: 'AgroConnect GH' },
        subject: 'Reset your password',
        content: [
          {
            type: 'text/html',
            value: `
              <h2>Reset your password</h2>
              <p>We received a request to reset your password.</p>
              <p><a href="${resetLink}">Reset password</a></p>
              <p>This link expires in 1 hour.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            `.trim(),
          },
        ],
      }),
    });

    if (!sendgridRes.ok) {
      const body = await sendgridRes.text();
      console.error('SendGrid error:', sendgridRes.status, body);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
