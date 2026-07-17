import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { AuthLoadingScreen } from './auth-loading-screen'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { state, profile, error, retry } = useAuth()

  if (state === 'loading') {
    if (error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-lg font-semibold text-earth-900 mb-2">Account Issue</h2>
          <p className="text-sm text-earth-500 mb-6 max-w-md text-center">{error}</p>
          <button onClick={retry} className="rounded-lg bg-agro-600 px-4 py-2 text-sm font-medium text-white hover:bg-agro-700">Try Again</button>
        </div>
      )
    }
    return <AuthLoadingScreen />
  }

  if (state === 'unauthenticated') return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') {
    if (profile?.role === 'seller') return <Navigate to="/seller/dashboard" replace />
    return <Navigate to="/marketplace" replace />
  }

  return <>{children}</>
}
