import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
}

export async function createSessionJWT(user: {
  id: string;
  email: string;
  role: string;
  full_name?: string;
}, opts?: { expiresIn?: string }): Promise<string> {
  const expiresIn = opts?.expiresIn || '7d';
  return new SignJWT({
    sub: user.id,
    email: user.email,
    role: 'authenticated',
    aud: 'authenticated',
    user_metadata: { full_name: user.full_name },
    app_metadata: { provider: 'email', providers: ['email'] },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setIssuer(SITE_URL)
    .sign(JWT_SECRET);
}

export async function verifySessionJWT(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: SITE_URL,
      audience: 'authenticated',
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
