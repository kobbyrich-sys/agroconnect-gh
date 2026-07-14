import { NextRequest, NextResponse } from 'next/server';
import { setEmailVerified } from '@agroconnect/shared';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    if (payload.purpose !== 'email-verify' || !payload.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    await setEmailVerified(payload.sub);

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}
