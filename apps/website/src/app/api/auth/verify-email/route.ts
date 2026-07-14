import { NextRequest, NextResponse } from 'next/server';
import { setEmailVerified, getProfileById } from '@agroconnect/shared';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing verification token.' }, { status: 400 });
  }

  // 1. Verify the JWT (signature, expiry, purpose)
  let payload;
  try {
    const result = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    payload = result.payload;
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
  }

  if (payload.purpose !== 'email-verify' || !payload.sub) {
    return NextResponse.json({ error: 'Invalid token purpose.' }, { status: 400 });
  }

  // 2. Check if already verified (separate try-catch to avoid masking JWT errors)
  try {
    const profile = await getProfileById(payload.sub);
    if (profile?.is_email_verified) {
      return NextResponse.json({ success: true, message: 'Email already verified. You\'re all set!' });
    }
  } catch {
    // DB error — non-fatal, continue to try setting verified
  }

  // 3. Mark as verified
  try {
    await setEmailVerified(payload.sub);
  } catch {
    return NextResponse.json({ error: 'Verification failed due to a server error. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Email verified successfully' });
}
