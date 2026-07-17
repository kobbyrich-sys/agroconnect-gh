import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { AuthLoadingScreen } from './auth-loading-screen'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state, error, retry } = useAuth()
  const location = useLocation()

  if (state === 'loading') {
    if (error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-lg font-semibold text-earth-900 mb-2">Account Issue</h2>
          <p className="text-sm text-earth-500 mb-6 max-w-md text-center">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={retry}
              className="rounded-lg bg-agro-600 px-4 py-2 text-sm font-medium text-white hover:bg-agro-700"
            >
              Try Again
            </button>
            <a
              href="mailto:agroconnect8@gmail.com"
              className="rounded-lg border border-earth-300 px-4 py-2 text-sm font-medium text-earth-700 hover:bg-earth-50"
            >
              Contact Support
            </a>
          </div>
        </div>
      )
    }
    return <AuthLoadingScreen />
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
