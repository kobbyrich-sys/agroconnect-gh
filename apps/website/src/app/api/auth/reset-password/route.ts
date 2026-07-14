import { NextRequest, NextResponse } from 'next/server';
import { updatePassword, getPasswordResetAt, recordPasswordReset } from '@agroconnect/shared';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

// In-memory rate limiter (per token). For production, replace with Vercel KV.
const attempts = new Map<string, { count: number; last: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record) return false;
  if (now - record.last > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
  record.count += 1;
  record.last = now;
  return false;
}

function recordAttempt(key: string) {
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
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    // Rate limit by token hash to prevent brute-force
    const tokenKey = token.slice(0, 16);
    if (isRateLimited(tokenKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many attempts. Please request a new reset link.' },
        { status: 429 },
      );
    }

    let payload;
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload;
    } catch {
      recordAttempt(tokenKey);
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 },
      );
    }

    if (!payload.sub || typeof payload.sub !== 'string' || !payload.iat) {
      return NextResponse.json(
        { success: false, error: 'Invalid reset token' },
        { status: 400 },
      );
    }

    // One-time use check: ensure token was issued after the last password reset
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

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to reset password. Please try again.' },
      { status: 500 },
    );
  }
}
