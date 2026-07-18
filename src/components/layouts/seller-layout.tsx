import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Logo } from '@/components/ui'

const navItems = [
  { to: '/seller/dashboard', label: 'Dashboard' },
  { to: '/seller/products', label: 'Products' },
  { to: '/seller/settings', label: 'Settings' },
]

export function SellerLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-earth-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo className="h-8 w-auto" linkTo="/" compact showTagline={false} />
          <div className="flex items-center gap-4">
            <Link to="/marketplace" className="text-sm font-medium text-earth-600 hover:text-agro-700">Marketplace</Link>
            <Link to="/orders" className="text-sm font-medium text-earth-600 hover:text-agro-700">Orders</Link>
            <Link to="/messages" className="text-sm font-medium text-earth-600 hover:text-agro-700">Messages</Link>
            <Link to="/wallet" className="text-sm font-medium text-earth-600 hover:text-agro-700">Wallet</Link>
            <span className="text-sm text-earth-400">|</span>
            <span className="text-sm text-earth-500">{profile?.full_name}</span>
            <button onClick={signOut} className="text-sm font-medium text-earth-500 hover:text-red-600">Sign Out</button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-56 border-r border-earth-200 bg-earth-50 p-4 flex-shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-agro-100 text-agro-800' : 'text-earth-600 hover:bg-earth-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
