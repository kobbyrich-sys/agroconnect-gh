import { NextResponse } from 'next/server';
import { createClient, applyCookies } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  try {
    const { password, token, email } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    if (token && email) {
      const admin = createAdminClient();
      const { data: updated, error: rpcError } = await admin.rpc('update_password_with_token', {
        p_email: email,
        p_token: token,
        p_password: password,
      });

      if (rpcError) {
        return NextResponse.json({ success: false, error: rpcError.message }, { status: 400 });
      }

      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired reset link. Please request a new one.' },
          { status: 400 },
        );
      }

      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    applyCookies(supabase, response);
    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'An error occurred' },
      { status: 500 },
    );
  }
}
