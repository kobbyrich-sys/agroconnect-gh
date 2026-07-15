'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getProfile } from '@/lib/supabase/helpers';
import type { Profile } from '@/lib/supabase/helpers';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true });
  const supabase = useRef(createClient());
  const initialized = useRef(false);

  const loadSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.current.auth.getSession();

    if (session?.user) {
      const profile = await getProfile(supabase.current, session.user.id);
      setState({ user: session.user, profile, loading: false });
    } else {
      setState({ user: null, profile: null, loading: false });
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    loadSession();

    const {
      data: { subscription },
    } = supabase.current.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await getProfile(supabase.current, session.user.id);
        setState({ user: session.user, profile, loading: false });
      } else {
        setState({ user: null, profile: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSession]);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    await loadSession();
  }, [loadSession]);

  const signOut = useCallback(async () => {
    await supabase.current.auth.signOut();
    setState({ user: null, profile: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
