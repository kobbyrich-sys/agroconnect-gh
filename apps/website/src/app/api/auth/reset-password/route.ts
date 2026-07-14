import { NextRequest, NextResponse } from 'next/server';
import { updatePassword } from '@agroconnect/shared';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

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

    let payload;
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 },
      );
    }

    if (!payload.sub || typeof payload.sub !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid reset token' },
        { status: 400 },
      );
    }

    await updatePassword(payload.sub, password);

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
