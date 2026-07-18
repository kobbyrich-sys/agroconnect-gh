import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui'

export function Footer() {
  return (
    <footer className="border-t border-earth-200 bg-earth-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4"><Logo className="h-8 w-auto" linkTo="/" compact showTagline={false} /></div>
            <p className="text-sm text-earth-600">
              Ghana&apos;s digital agricultural marketplace connecting farmers, processors, and buyers.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-earth-900 mb-3">Marketplace</h3>
            <ul className="space-y-2 text-sm text-earth-600">
              <li><Link to="/marketplace" className="hover:text-agro-700 transition-colors">Browse Products</Link></li>
              <li><Link to="/marketplace" className="hover:text-agro-700 transition-colors">Categories</Link></li>
              <li><Link to="/become-seller" className="hover:text-agro-700 transition-colors">Sell on AgroConnect</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-earth-900 mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-earth-600">
              <li><Link to="/help" className="hover:text-agro-700 transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-agro-700 transition-colors">Contact Us</Link></li>
              <li><Link to="/terms" className="hover:text-agro-700 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-agro-700 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-earth-900 mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-earth-600">
              <li>Accra, Ghana</li>
              <li>info@agroconnectgh.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-earth-200 pt-8 text-center text-sm text-earth-500">
          &copy; {new Date().getFullYear()} AgroConnect GH. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
