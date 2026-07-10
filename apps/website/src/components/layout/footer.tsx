import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-emerald-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <span className="text-xs font-bold text-white">AG</span>
              </div>
              <span className="text-lg font-bold text-white">AgroConnect GH</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Ghana&apos;s premier digital marketplace connecting farmers, manufacturers, wholesalers, retailers, and consumers.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: '/marketplace', label: 'Marketplace' },
                { href: '/categories', label: 'Categories' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/sell', label: 'Start Selling' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Categories</h3>
            <ul className="space-y-3">
              {[
                'Vegetables',
                'Fruits',
                'Grains & Cereals',
                'Dairy & Eggs',
                'Livestock',
                'Equipment',
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/categories/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>Accra, Ghana</li>
              <li>info@agroconnectgh.com</li>
              <li>+233 XX XXX XXXX</li>
              <li className="pt-2">
                <Link href="/support" className="text-emerald-400 transition-colors hover:text-emerald-300">
                  Support Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} AgroConnect GH. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
