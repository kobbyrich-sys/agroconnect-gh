'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';

const ROLE_MEMORY_KEY = 'agroconnect_role_memory';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  roles: string[];
  active_role: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  status?: string;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  activeRole: string;
  roles: string[];
  switchRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
  activeRole: '',
  roles: [],
  switchRole: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<string>('');
  const pendingRef = useRef(false);

  const roles = user?.roles || [];

  const refresh = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        const u = data.user ?? null;
        setUser(u);
        if (u) {
          const rememberedRole = typeof window !== 'undefined'
            ? localStorage.getItem(ROLE_MEMORY_KEY)
            : null;
          const savedRole = rememberedRole && u.roles.includes(rememberedRole)
            ? rememberedRole
            : u.active_role || u.roles[0] || 'buyer';
          setActiveRole(savedRole);
        }
      } else {
        setUser(null);
        setActiveRole('');
      }
    } catch {
      setUser(null);
      setActiveRole('');
    } finally {
      setLoading(false);
      pendingRef.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setActiveRole('');
    window.location.href = '/';
  }, []);

  const switchRole = useCallback((role: string) => {
    if (!user?.roles.includes(role)) return;
    setActiveRole(role);
    localStorage.setItem(ROLE_MEMORY_KEY, role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut, activeRole, roles, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
