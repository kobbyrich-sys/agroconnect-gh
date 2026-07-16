import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

interface GuestGuardProps {
  children: React.ReactNode
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-agro-200 border-t-agro-600" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  return <>{children}</>
}
