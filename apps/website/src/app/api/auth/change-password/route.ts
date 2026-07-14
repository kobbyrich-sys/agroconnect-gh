import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, updatePassword, getSessionToken, verifySessionJWT, invalidateSessions } from '@agroconnect/shared';

export async function POST(request: NextRequest) {
  try {
    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifySessionJWT(token);
    if (!payload?.sub || !payload.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 },
      );
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters' },
        { status: 400 },
      );
    }

    if (current_password === new_password) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from current password' },
        { status: 400 },
      );
    }

    const user = await verifyPassword(payload.email, current_password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 },
      );
    }

    await updatePassword(payload.sub, new_password);
    await invalidateSessions(payload.sub);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. Please sign in again.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to change password. Please try again.' },
      { status: 500 },
    );
  }
}
