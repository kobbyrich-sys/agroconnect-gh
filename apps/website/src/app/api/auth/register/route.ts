import { NextResponse } from 'next/server';
import { createAdminClient, createServerClient } from '@agroconnect/shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone, role } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and full name are required' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name, phone, role: role || 'buyer' },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created. Please check your email to verify.',
        user: data.user
          ? {
              id: data.user.id,
              email: data.user.email,
              full_name,
              role: role || 'buyer',
            }
          : null,
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
