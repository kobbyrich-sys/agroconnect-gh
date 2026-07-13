import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { SignJWT } from 'jose';

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

    const pool = new Pool({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || '6543'),
      database: 'postgres',
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASS,
      max: 1,
      connectionTimeoutMillis: 10000,
    });

    const hashResult = await pool.query<{ hash: string }>(
      `SELECT crypt($1, gen_salt('bf', 10)) AS hash`,
      [password],
    );
    const bcryptHash = hashResult.rows[0].hash;

    const result = await pool.query<{ id: string; email: string }>(
      `INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
       VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', $1, $2, NOW(), $3::jsonb, '{"provider":"email","providers":["email"]}', NOW(), NOW(), '', '', '', '')
       RETURNING id, email`,
      [email.toLowerCase(), bcryptHash, JSON.stringify({ full_name, phone, role: (role === 'seller' ? 'farmer' : (role || 'buyer')) })],
    );

    const user = result.rows[0];

    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '').split('.')[0] || '';
    const jwtSecret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET || '');
    const now = Math.floor(Date.now() / 1000);

    const accessToken = await new SignJWT({
      sub: user.id,
      email: user.email,
      role: 'authenticated',
      aud: 'authenticated',
      iat: now,
      exp: now + 3600,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(jwtSecret);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created.',
        user: {
          id: user.id,
          email: user.email,
          full_name,
          role: role || 'buyer',
        },
        session: {
          access_token: accessToken,
          refresh_token: accessToken,
          expires_at: now + 3600,
        },
      },
      { status: 201 },
    );

    const cookieName = `sb-${projectRef}-auth-token`;
    const cookieValue = JSON.stringify([accessToken, accessToken, 3600, 'bearer']);

    response.cookies.set(cookieName, cookieValue, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
    });

    await pool.end();

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 400 },
    );
  }
}
