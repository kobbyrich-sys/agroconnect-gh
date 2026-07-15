import { NextResponse } from 'next/server';
import { verifySessionJWT, getSessionToken, invalidateSessions, audit } from '@agroconnect/shared';

const SESSION_COOKIE = 'agroconnect_session';

export async function POST() {
  try {
    const token = await getSessionToken();
    if (token) {
      const payload = await verifySessionJWT(token);
      if (payload?.sub) {
        await invalidateSessions(payload.sub);
        audit('logout', { userId: payload.sub });
      }
    }
  } catch {
    // Proceed with cookie cleanup even if server-side invalidation fails
  }

  const response = NextResponse.json({ success: true, message: 'Signed out' });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
