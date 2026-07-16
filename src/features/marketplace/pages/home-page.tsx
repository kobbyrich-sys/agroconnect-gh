import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-agro-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-earth-900 sm:text-5xl lg:text-6xl">
              Ghana&apos;s Agricultural{' '}
              <span className="text-agro-600">Marketplace</span>
            </h1>
            <p className="mt-6 text-lg text-earth-600">
              Connect directly with farmers, agro-processors, and buyers across Ghana.
              Trade agricultural products securely with escrow protection.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/marketplace">
                <Button size="lg">Browse Products</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">Start Selling</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-earth-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { title: 'Browse & Discover', description: 'Explore products from verified sellers across Ghana.' },
              { title: 'Trade Securely', description: 'Payments held in escrow until you\'re satisfied.' },
              { title: 'Grow Together', description: 'Build lasting business relationships in agriculture.' },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-agro-100 text-agro-700 font-bold text-lg">
                  {/* icon placeholder */}
                </div>
                <h3 className="text-lg font-semibold text-earth-900 mb-2">{step.title}</h3>
                <p className="text-sm text-earth-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
