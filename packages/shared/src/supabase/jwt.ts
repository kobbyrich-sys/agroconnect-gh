import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface SessionPayload extends JWTPayload {
  sub: string;
  email: string;
  role: string;
  roles: string[];
  active_role: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
  token_valid_since?: number;
}

export async function createSessionJWT(user: {
  id: string;
  email: string;
  role: string;
  roles: string[];
  active_role: string;
  full_name?: string;
}, opts?: { expiresIn?: string; tokenValidSince?: Date | null }): Promise<string> {
  const raw = opts?.expiresIn || '7d';
  const days = parseInt(raw) || 7;
  const cappedDays = Math.min(days, 30);
  const expiresIn = cappedDays + 'd';
  const payload: Record<string, unknown> = {
    sub: user.id,
    email: user.email,
    role: 'authenticated',
    roles: user.roles,
    active_role: user.active_role,
    aud: 'authenticated',
    user_metadata: { full_name: user.full_name, role: user.role },
    app_metadata: { provider: 'email', providers: ['email'], role: user.role },
  };
  if (opts?.tokenValidSince) {
    payload.token_valid_since = Math.floor(new Date(opts.tokenValidSince).getTime() / 1000);
  }
  return new SignJWT(payload)
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
