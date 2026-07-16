import { useContext } from 'react'
import { AuthContext } from '@/features/auth/contexts/auth-context'
import type { AuthContextType } from '@/features/auth/contexts/auth-context'

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
