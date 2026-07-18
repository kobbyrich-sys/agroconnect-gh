import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui'
import { CartContext } from '@/features/cart/contexts/cart-context'
import { NotificationBell } from '@/features/notifications/components/notification-bell'

export function Header() {
  const { state, profile, signOut } = useAuth()
  const { count } = useContext(CartContext)!
  const [menuOpen, setMenuOpen] = useState(false)
  const isAuthed = state === 'authenticated'

  const authedLinks = (
    <>
      {profile?.role === 'buyer' && (
        <Link to="/become-seller" className="text-sm font-medium text-agro-600 hover:text-agro-700 transition-colors" onClick={() => setMenuOpen(false)}>
          Sell on AgroConnect
        </Link>
      )}
      <Link to="/orders" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors" onClick={() => setMenuOpen(false)}>
        Orders
      </Link>
      <Link to="/messages" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors" onClick={() => setMenuOpen(false)}>
        Messages
      </Link>
      <NotificationBell />
      <Link to="/cart" className="relative text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors" onClick={() => setMenuOpen(false)}>
        Cart{count > 0 && <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-agro-600 text-[10px] font-bold text-white">{count > 9 ? '9+' : count}</span>}
      </Link>
      <Link to="/favorites" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors" onClick={() => setMenuOpen(false)}>
        Favorites
      </Link>
      <Link to="/wallet" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors" onClick={() => setMenuOpen(false)}>
        Wallet
      </Link>
      {profile?.role === 'admin' && (
        <Link to="/admin" className="text-sm font-medium text-agro-600 hover:text-agro-700 transition-colors" onClick={() => setMenuOpen(false)}>
          Admin
        </Link>
      )}
      <Link to="/profile" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors" onClick={() => setMenuOpen(false)}>
        {profile?.full_name ?? 'Profile'}
      </Link>
      <button
        onClick={() => { signOut(); setMenuOpen(false) }}
        className="text-sm font-medium text-earth-500 hover:text-red-600 transition-colors text-left"
      >
        Sign Out
      </button>
    </>
  )

  const guestLinks = state !== 'loading' ? (
    <>
      <Link to="/login" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors" onClick={() => setMenuOpen(false)}>
        Sign In
      </Link>
      <Link to="/register" onClick={() => setMenuOpen(false)}>
        <Button size="sm">Get Started</Button>
      </Link>
    </>
  ) : null

  return (
    <header className="sticky top-0 z-50 border-b border-earth-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="AgroConnect GH" className="h-8 w-auto" />
          <span className="text-xl font-bold text-agro-800">
            AgroConnect<span className="text-earth-600">GH</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          <Link to="/marketplace" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
            Marketplace
          </Link>
          {isAuthed ? authedLinks : guestLinks}
        </nav>
        <button className="md:hidden p-2 text-earth-600" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-earth-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to="/marketplace" className="text-sm font-medium text-earth-600 hover:text-agro-700" onClick={() => setMenuOpen(false)}>Marketplace</Link>
            {isAuthed ? authedLinks : guestLinks}
          </nav>
        </div>
      )}
    </header>
  )
}
