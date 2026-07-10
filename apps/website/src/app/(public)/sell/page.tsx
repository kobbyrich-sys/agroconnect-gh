import Link from 'next/link';

export default function SellPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold">Start Selling on AgroConnect GH</h1>
          <p className="mt-4 text-lg text-emerald-100">
            Reach thousands of buyers across Ghana. Register your business, list your products, and grow your sales.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-amber-600 px-8 py-3.5 text-sm font-semibold hover:bg-amber-700"
            >
              Register as Seller
            </Link>
            <Link
              href="/marketplace"
              className="rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold hover:bg-white/10"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Register & Verify', desc: 'Create your account, register your business, and complete verification with your Ghana Card.' },
              { step: '2', title: 'List Your Products', desc: 'Upload product photos, set prices, manage inventory, and start reaching buyers immediately.' },
              { step: '3', title: 'Sell & Get Paid', desc: 'Receive orders, process payments via Mobile Money or bank transfer, and withdraw your earnings.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Who Can Sell?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Farmers', desc: 'Sell fresh produce, livestock, and agricultural products directly to buyers.' },
              { title: 'Manufacturers', desc: 'List manufactured goods, processed foods, and industrial supplies.' },
              { title: 'Wholesalers', desc: 'Distribute products in bulk to retailers, restaurants, and businesses.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
