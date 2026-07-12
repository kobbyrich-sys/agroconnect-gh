import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';
import { createHmac } from 'crypto';

function verifyResetToken(token: string): { email: string } | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSig = createHmac('sha256', process.env.SUPABASE_JWT_SECRET!)
    .update(payload)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (Date.now() > data.exp) return null;

  return { email: data.email };
}

export async function POST(request: Request) {
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

    const payload = verifyResetToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', payload.email)
      .maybeSingle();

    if (!users) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    const { error } = await supabase.auth.admin.updateUserById(users.id, {
      password,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
