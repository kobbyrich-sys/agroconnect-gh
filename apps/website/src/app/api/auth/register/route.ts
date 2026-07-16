import { NextResponse } from 'next/server';
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

    const { data: userData, error: createError } = await admin.rpc('create_user', {
      p_email: email,
      p_password: password,
      p_full_name: full_name,
    });

    if (createError) {
      if (createError.message?.includes('already exists') || createError.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'An account already exists with this email.',
            links: { login: true, forgot_password: true },
          },
          { status: 409 },
        );
      }
      return NextResponse.json({ success: false, error: createError.message }, { status: 400 });
    }

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Registration failed. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'An error occurred' },
      { status: 500 },
    );
  }
}
