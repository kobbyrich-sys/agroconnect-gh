import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui'
import { useContext } from 'react'
import { CartContext } from '@/features/cart/contexts/cart-context'

export function Header() {
  const { state, profile, signOut } = useAuth()
  const { count } = useContext(CartContext)!
  const isAuthed = state === 'authenticated'

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
          {isAuthed ? (
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
              <Link to="/cart" className="relative text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
                Cart{count > 0 && <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-agro-600 text-[10px] font-bold text-white">{count > 9 ? '9+' : count}</span>}
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
          ) : state !== 'loading' ? (
            <>
              <Link to="/login" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
                Sign In
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
