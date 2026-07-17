import { createContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextType {
  state: AuthState
  user: User | null
  profile: Profile | null
  session: Session | null
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null; role?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  retry: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
