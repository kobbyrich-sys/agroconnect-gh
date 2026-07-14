import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.SUPABASE_DB_HOST!,
      port: parseInt(process.env.SUPABASE_DB_PORT || '6543'),
      database: 'postgres',
      user: process.env.SUPABASE_DB_USER!,
      password: process.env.SUPABASE_DB_PASS!,
      max: 5,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  role?: string,
): Promise<{ id: string }> {
  const result = await getPool().query(
    `SELECT public.register_user(
      $1::text, $2::text, $3::text, $4::text, $5::text
    ) as id`,
    [email, password, fullName, phone || null, role || 'buyer'],
  );
  return { id: result.rows[0].id };
}

export async function verifyPassword(
  email: string,
  password: string,
): Promise<{
  user_id: string;
  user_email: string;
  user_role: string;
  user_status: string;
} | null> {
  const result = await getPool().query(
    `SELECT * FROM public.verify_password($1::text, $2::text)`,
    [email, password],
  );
  return result.rows[0] || null;
}

export async function updatePassword(
  userId: string,
  newPassword: string,
): Promise<boolean> {
  const result = await getPool().query(
    `SELECT public.update_password($1::uuid, $2::text) as ok`,
    [userId, newPassword],
  );
  return result.rows[0]?.ok === true;
}

export async function getUserByEmail(
  email: string,
): Promise<{
  user_id: string;
  user_email: string;
  user_role: string;
  user_status: string;
  full_name: string;
} | null> {
  const result = await getPool().query(
    `SELECT * FROM public.get_user_by_email($1::text)`,
    [email],
  );
  return result.rows[0] || null;
}

export async function getProfileById(userId: string) {
  const result = await getPool().query(
    `SELECT * FROM public.profiles WHERE id = $1`,
    [userId],
  );
  return result.rows[0] || null;
}

export async function setEmailVerified(userId: string) {
  await getPool().query(
    `UPDATE public.profiles SET is_email_verified = true, email_verified_at = now() WHERE id = $1`,
    [userId],
  );
  await getPool().query(
    `UPDATE auth.users SET email_confirmed_at = now() WHERE id = $1`,
    [userId],
  );
}

export async function invalidateSessions(userId: string) {
  try {
    await getPool().query(
      `UPDATE public.profiles SET token_valid_since = NOW() WHERE id = $1`,
      [userId],
    );
  } catch {
    // Column may not exist yet; session cookie deletion still happens client-side
  }
}

export async function getTokenValidity(userId: string): Promise<Date | null> {
  try {
    const result = await getPool().query(
      `SELECT token_valid_since FROM public.profiles WHERE id = $1`,
      [userId],
    );
    return result.rows[0]?.token_valid_since || null;
  } catch {
    return null;
  }
}

export async function getPasswordResetAt(userId: string): Promise<Date | null> {
  try {
    const result = await getPool().query(
      `SELECT last_password_reset_at FROM public.profiles WHERE id = $1`,
      [userId],
    );
    return result.rows[0]?.last_password_reset_at || null;
  } catch {
    return null;
  }
}

export async function recordPasswordReset(userId: string) {
  try {
    await getPool().query(
      `UPDATE public.profiles SET last_password_reset_at = NOW() WHERE id = $1`,
      [userId],
    );
  } catch {
    // Column may not exist yet; password update still succeeds
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
