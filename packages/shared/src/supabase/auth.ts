import { getSessionToken } from './session';
import { verifySessionJWT } from './jwt';

export interface AuthUser {
  id: string;
  email: string;
  /** The platform role from profiles.role (buyer / seller / admin / super_admin) */
  role: string;
  /** Platform roles from user_roles (buyer, seller) */
  roles: string[];
  /** The currently active role */
  active_role: string;
  full_name?: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const payload = await verifySessionJWT(token);
  if (!payload?.sub) return null;

  const metadata = (payload.user_metadata || {}) as Record<string, unknown>;

  return {
    id: payload.sub,
    email: payload.email || '',
    role: (metadata.role as string) || '',
    roles: payload.roles || [],
    active_role: payload.active_role || '',
    full_name: metadata.full_name as string | undefined,
  };
}
