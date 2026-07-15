import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: existingUser } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account already exists with this email.',
          links: { login: true, forgot_password: true },
        },
        { status: 409 },
      );
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });

    if (signUpError) {
      return NextResponse.json({ success: false, error: signUpError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Registration failed. Please try again.' },
        { status: 500 },
      );
    }

    const { error: profileError } = await admin.from('profiles').upsert({
      id: authData.user.id,
      email,
      full_name,
      role: 'buyer',
      status: 'active',
    });

    if (profileError) {
      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: { id: authData.user.id, email, full_name, role: 'buyer' },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'An error occurred' },
      { status: 500 },
    );
  }
}
