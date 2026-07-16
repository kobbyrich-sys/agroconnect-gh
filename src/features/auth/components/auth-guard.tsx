import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'buyer' | 'seller' | 'admin'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-agro-200 border-t-agro-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
