import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui'

export function Header() {
  const { user, profile, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-earth-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="AgroConnect GH" className="h-8 w-auto" />
          <span className="text-xl font-bold text-agro-800">
            AgroConnect<span className="text-earth-600">GH</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/marketplace" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
            Marketplace
          </Link>
          {user ? (
            <>
              {profile?.role === 'buyer' && (
                <Link to="/become-seller" className="text-sm font-medium text-agro-600 hover:text-agro-700 transition-colors">
                  Sell on AgroConnect
                </Link>
              )}
              <Link to="/orders" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
                Orders
              </Link>
              <Link to="/messages" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
                Messages
              </Link>
              <Link to="/favorites" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
                Favorites
              </Link>
              <Link to="/wallet" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
                Wallet
              </Link>
              {profile?.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium text-agro-600 hover:text-agro-700 transition-colors">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
                {profile?.full_name ?? 'Profile'}
              </Link>
              <button
                onClick={signOut}
                className="text-sm font-medium text-earth-500 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
                Sign In
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
