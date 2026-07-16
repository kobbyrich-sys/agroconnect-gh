import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-earth-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="AgroConnect GH" className="h-8 w-auto" />
          <span className="text-xl font-bold text-agro-800">
            AgroConnect<span className="text-earth-600">GH</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/marketplace" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
            Marketplace
          </Link>
          <Link to="/login" className="text-sm font-medium text-earth-600 hover:text-agro-700 transition-colors">
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-agro-600 px-4 py-2 text-sm font-medium text-white hover:bg-agro-700 transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  )
}
