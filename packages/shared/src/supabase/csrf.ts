import { SignJWT, jwtVerify } from 'jose';

const CSRF_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET + ':csrf',
);

export async function createCsrfToken(): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(CSRF_SECRET);
}

export async function verifyCsrfToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, CSRF_SECRET);
    return true;
  } catch {
    return false;
  }
}
