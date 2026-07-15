import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ success: false, error: signInError.message }, { status: 401 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('id, email, full_name, phone, role, region, avatar_url, status, created_at, updated_at')
      .eq('id', authData.user.id)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      profile: profile || { role: 'buyer' },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'An error occurred' },
      { status: 500 },
    );
  }
}
