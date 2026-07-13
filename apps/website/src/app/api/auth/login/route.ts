import { NextResponse } from 'next/server';
import { createServerClient } from '@agroconnect/shared';
import { Pool } from 'pg';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: profile?.full_name,
          phone: profile?.phone,
          avatar_url: profile?.avatar_url,
          role: profile?.role || 'buyer',
          status: profile?.status,
          is_email_verified: !!data.user.email_confirmed_at,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      });
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

    const userResult = await pool.query<{ id: string; email: string; encrypted_password: string }>(
      `SELECT id, email, encrypted_password FROM auth.users WHERE email = $1 AND deleted_at IS NULL AND (banned_until IS NULL OR banned_until < NOW())`,
      [email.toLowerCase()],
    );

    if (userResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const user = userResult.rows[0];

    const matchResult = await pool.query<{ match: boolean }>(
      `SELECT crypt($1, $2) = $2 AS match`,
      [password, user.encrypted_password],
    );

    if (!matchResult.rows[0].match) {
      await pool.end();
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

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

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
        role: profile?.role || 'buyer',
        status: profile?.status,
        is_email_verified: true,
      },
      session: {
        access_token: accessToken,
        refresh_token: accessToken,
        expires_at: now + 3600,
      },
    });

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
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}