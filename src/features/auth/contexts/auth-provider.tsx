import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'
import { AuthContext } from './auth-context'
import type { AuthState } from './auth-context'

async function fetchProfileById(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  return data as Profile | null
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
    setSession(s)
    setUser(s?.user ?? null)

    if (!s?.user) {
      setProfile(null)
      setState('unauthenticated')
      setError(null)
      return
    }

    setState('loading')
    setError(null)

    const profile = await ensureProfile(s.user.id)

    if (!profile) {
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

    if (!profile) {
      setError(
        'We could not load your account profile. This may be a temporary issue. Please try refreshing the page or contact support.'
      )
      setState('loading')
      return
    }

    if (!['buyer', 'seller', 'admin'].includes(profile.role)) {
      setError(`Invalid account role: "${profile.role}". Please contact support.`)
      setState('loading')
      return
    }

    setProfile(profile)
    setState('authenticated')
  }, [])

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session: s } }) => resolveSession(s))
      .catch(() => {
        setState('unauthenticated')
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      resolveSession(s)
    })

    return () => subscription.unsubscribe()
  }, [resolveSession])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) return { error: err.message }

    const s = data.session
    setSession(s)
    setUser(s?.user ?? null)

    if (!s?.user) return { error: 'Authentication succeeded but no user was returned.' }

    const profile = await ensureProfile(s.user.id)

    if (!profile) {
      return { error: 'Your account profile could not be found. Please contact support.' }
    }

    if (!['buyer', 'seller', 'admin'].includes(profile.role)) {
      return { error: `Invalid account role: "${profile.role}". Please contact support.` }
    }

    setProfile(profile)
    setState('authenticated')
    return { error: null, role: profile.role }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error: err?.message || null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState('unauthenticated')
    setUser(null)
    setProfile(null)
    setSession(null)
    setError(null)
  }, [])

  const retry = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession()
    resolveSession(s)
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
