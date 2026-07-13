import { NextResponse } from 'next/server';

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

    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.SUPABASE_DB_HOST,
      port: parseInt(process.env.SUPABASE_DB_PORT || '6543'),
      database: 'postgres',
      user: process.env.SUPABASE_DB_USER,
      password: process.env.SUPABASE_DB_PASS,
      max: 1,
      connectionTimeoutMillis: 10000,
    });

    const bcryptHash = await new Promise<string>((resolve, reject) => {
      pool.query(
        `SELECT crypt($1, gen_salt('bf', 10)) AS hash`,
        [password],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.rows[0].hash);
        },
      );
    });

    const result = await pool.query(
      `INSERT INTO auth.users (instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
       VALUES ('00000000-0000-0000-0000-000000000000', $1, $2, NOW(), $3::jsonb, '{"provider":"email","providers":["email"]}', NOW(), NOW(), '', '', '', '')
       RETURNING id, email`,
      [email.toLowerCase(), bcryptHash, JSON.stringify({ full_name, phone, role: (role === 'seller' ? 'farmer' : (role || 'buyer')) })],
    );

    await pool.end();

    const user = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Account created. Please check your email to verify.',
        user: {
          id: user.id,
          email: user.email,
          full_name,
          role: role || 'buyer',
        },
      },
      { status: 201 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 400 },
    );
  }
}
