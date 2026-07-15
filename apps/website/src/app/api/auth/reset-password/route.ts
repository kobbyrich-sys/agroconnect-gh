import { NextRequest, NextResponse } from 'next/server';
import { updatePassword, getPasswordResetAt, recordPasswordReset, RateLimiter, audit } from '@agroconnect/shared';
import { jwtVerify } from 'jose';

const RESET_SECRET = new TextEncoder().encode(
  (process.env.RESET_PASSWORD_SECRET || process.env.SUPABASE_JWT_SECRET)! + ':reset'
);

const resetPwLimiter = new RateLimiter(5, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, error: 'Token and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const tokenKey = token.slice(0, 16);
    const { allowed, retryAfter } = resetPwLimiter.check(tokenKey);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Try again in ${retryAfter} seconds.` },
        { status: 429 },
      );
    }

    let payload;
    try {
      const result = await jwtVerify(token, RESET_SECRET);
      payload = result.payload;
    } catch {
      resetPwLimiter.increment(tokenKey);
      return NextResponse.json({ success: false, error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (!payload.sub || typeof payload.sub !== 'string' || !payload.iat) {
      return NextResponse.json({ success: false, error: 'Invalid reset token' }, { status: 400 });
    }

    const lastResetAt = await getPasswordResetAt(payload.sub);
    if (lastResetAt) {
      const resetEpoch = Math.floor(new Date(lastResetAt).getTime() / 1000);
      if (payload.iat <= resetEpoch) {
        return NextResponse.json(
          { success: false, error: 'This reset link has already been used. Please request a new one.' },
          { status: 400 },
        );
      }
    }

    await updatePassword(payload.sub, password);
    await recordPasswordReset(payload.sub);

    audit('reset-password.success', { userId: payload.sub });

    return NextResponse.json({
      success: true, message: 'Password updated successfully. You can now sign in.',
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
