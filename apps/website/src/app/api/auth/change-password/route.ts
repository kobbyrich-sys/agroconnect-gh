import { NextRequest, NextResponse } from 'next/server';
import { verifySessionJWT, getSessionToken, verifyPassword, updatePassword, invalidateSessions, RateLimiter, audit } from '@agroconnect/shared';

const changePwLimiter = new RateLimiter(3, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password) {
      return NextResponse.json({ success: false, error: 'Current and new password are required' }, { status: 400 });
    }
    if (new_password.length < 8) {
      return NextResponse.json({ success: false, error: 'New password must be at least 8 characters' }, { status: 400 });
    }
    if (current_password === new_password) {
      return NextResponse.json({ success: false, error: 'New password must be different from current password' }, { status: 400 });
    }

    const sessionToken = await getSessionToken();
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifySessionJWT(sessionToken);
    if (!payload?.sub || !payload?.email) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { allowed, retryAfter } = changePwLimiter.check(payload.sub);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Try again in ${retryAfter} seconds.`, retry_after: retryAfter },
        { status: 429 },
      );
    }

    const verified = await verifyPassword(payload.email, current_password);
    if (!verified) {
      changePwLimiter.increment(payload.sub);
      audit('change-password.failed', { userId: payload.sub });
      return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 401 });
    }

    changePwLimiter.reset(payload.sub);
    await updatePassword(payload.sub, new_password);
    await invalidateSessions(payload.sub);

    audit('change-password.success', { userId: payload.sub });

    const response = NextResponse.json({ success: true, message: 'Password changed. Please sign in again.' });
    response.cookies.delete('agroconnect_session');
    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to change password. Please try again.' }, { status: 500 });
  }
}
