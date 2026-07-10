import Link from 'next/link';

const categories = [
  { name: 'Vegetables', slug: 'vegetables', count: '2,340+', icon: '🥬' },
  { name: 'Fruits', slug: 'fruits', count: '1,890+', icon: '🍎' },
  { name: 'Grains & Cereals', slug: 'grains-cereals', count: '980+', icon: '🌾' },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', count: '560+', icon: '🥚' },
  { name: 'Livestock', slug: 'livestock-poultry', count: '420+', icon: '🐄' },
  { name: 'Farming Equipment', slug: 'farming-equipment', count: '1,120+', icon: '🔧' },
];

const features = [
  { title: 'Direct from Farmers', desc: 'Fresh produce sourced directly from Ghanaian farms, no middlemen.' },
  { title: 'Secure Payments', desc: 'Protected transactions with Mobile Money, Paystack, and bank transfer.' },
  { title: 'Fast Delivery', desc: 'Reliable delivery across all 16 regions of Ghana with real-time tracking.' },
  { title: 'Verified Sellers', desc: 'All sellers are verified with Ghana Card and business registration.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Ghana&apos;s Agricultural{' '}
              <span className="text-emerald-300">Marketplace</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-emerald-100">
              Connect directly with farmers, manufacturers, and wholesalers across Ghana. 
              Buy fresh produce, equipment, and supplies — or grow your business selling to thousands.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/marketplace"
                className="rounded-lg bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-amber-700"
              >
                Browse Products
              </Link>
              <Link
                href="/sell"
                className="rounded-lg border-2 border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Start Selling
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-8 text-sm text-emerald-200">
              <span>12,000+ Products</span>
              <span className="h-4 w-px bg-emerald-600" />
              <span>1,200+ Sellers</span>
              <span className="h-4 w-px bg-emerald-600" />
              <span>16 Regions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="mt-3 text-gray-500">Find exactly what you need from our wide selection</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group rounded-xl border border-gray-200 p-6 text-center transition-all hover:border-emerald-200 hover:shadow-md"
              >
                <span className="text-4xl">{cat.icon}</span>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">{cat.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{cat.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why AgroConnect GH?</h2>
            <p className="mt-3 text-gray-500">Built for Ghana, built for you</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-800 to-emerald-700 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="text-3xl font-bold text-white">Ready to grow your business?</h2>
          <p className="mt-4 text-lg text-emerald-100">
            Join thousands of Ghanaian farmers, manufacturers, and sellers on AgroConnect GH.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-amber-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Create Free Account
            </Link>
            <Link
              href="/about"
              className="rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
