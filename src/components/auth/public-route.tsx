import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { state, profile } = useAuth()

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-agro-200 border-t-agro-600" />
      </div>
    )
  }

  if (state === 'authenticated') {
    if (profile?.role === 'admin') return <Navigate to="/admin" replace />
    if (profile?.role === 'seller') return <Navigate to="/seller/dashboard" replace />
    return <Navigate to="/marketplace" replace />
  }

  return <>{children}</>
}
