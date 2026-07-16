import { NextResponse } from 'next/server';
import { createAdminClient } from '@agroconnect/shared';
import { getBaseUrl } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const { data: token, error } = await admin.rpc('generate_reset_token', { p_email: email });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ success: true });
    }

    const resetLink = `${getBaseUrl()}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    return NextResponse.json({ success: true, resetLink });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'An error occurred' },
      { status: 500 },
    );
  }
}
