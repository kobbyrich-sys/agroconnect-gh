import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  try {
    const { phone, token } = await request.json();

    if (!phone || !token) {
      return NextResponse.json(
        { success: false, error: 'Phone and token are required' },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      session: data.session
        ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }
        : null,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
