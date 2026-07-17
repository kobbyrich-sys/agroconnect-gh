import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'
import { AuthContext } from './auth-context'
import type { AuthState } from './auth-context'

async function fetchProfileById(userId: string): Promise<Profile | null> {
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    return data as Profile | null
  } catch {
    return null
  }
}

async function ensureProfile(userId: string, retries = 3): Promise<Profile | null> {
  for (let i = 0; i < retries; i++) {
    const profile = await fetchProfileById(userId)
    if (profile) return profile
    if (i < retries - 1) await new Promise((r) => setTimeout(r, 800))
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resolveSession = useCallback(async (s: Session | null) => {
    try {
      setSession(s)
      setUser(s?.user ?? null)

      setError(null)

      if (!s?.user) {
        setProfile(null)
        setState('unauthenticated')
        return
      }

      setState('loading')

      const found = await ensureProfile(s.user.id)

      if (!found) {
        try {
          await (supabase.from('profiles') as any).insert({
            id: s.user.id,
            full_name: s.user.user_metadata?.full_name || s.user.email?.split('@')[0] || 'User',
            role: 'buyer',
          })
          const retryProfile = await fetchProfileById(s.user.id)
          if (retryProfile) {
            setProfile(retryProfile)
            setState('authenticated')
            return
          }
        } catch {
        }
      }

      if (found) {
        if (!['buyer', 'seller', 'admin'].includes(found.role)) {
          setError(`Invalid account role: "${found.role}". Please contact support.`)
          setState('unauthenticated')
          return
        }
        setProfile(found)
        setState('authenticated')
      } else {
        setError('Your account profile could not be found. Please try refreshing the page or contact support.')
        setState('unauthenticated')
      }
    } catch {
      setError('A network error occurred while loading your account. Please try again.')
      setState('unauthenticated')
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session: s } }) => resolveSession(s))
      .catch(() => setState('unauthenticated'))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      resolveSession(s)
    })

    return () => subscription.unsubscribe()
  }, [resolveSession])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) return { error: err.message }

      const s = data.session
      setSession(s)
      setUser(s?.user ?? null)

      if (!s?.user) return { error: 'Authentication succeeded but no user was returned.' }

      const found = await ensureProfile(s.user.id)

      if (found) {
        if (!['buyer', 'seller', 'admin'].includes(found.role)) {
          return { error: `Invalid account role: "${found.role}". Please contact support.` }
        }
        setProfile(found)
        setState('authenticated')
        return { error: null, role: found.role }
      }

      return { error: 'Your account profile could not be found. Please contact support.' }
    } catch {
      return { error: 'A network error occurred. Please try again.' }
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      return { error: err?.message || null }
    } catch {
      return { error: 'A network error occurred. Please try again.' }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {
    }
    setState('unauthenticated')
    setUser(null)
    setProfile(null)
    setSession(null)
    setError(null)
  }, [])

  const retry = useCallback(async () => {
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      resolveSession(s)
    } catch {
      setState('unauthenticated')
    }
  }, [resolveSession])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    const refreshed = await fetchProfileById(user.id)
    if (refreshed) setProfile(refreshed)
  }, [user])

  return (
    <AuthContext.Provider value={{ state, user, profile, session, error, signIn, signUp, signOut, retry, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
