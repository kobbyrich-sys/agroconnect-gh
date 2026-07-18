import { Link } from 'react-router-dom'
import { SeoHelmet } from '@/components/seo/helmet'

export function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SeoHelmet title="Help Center" />
      <h1 className="text-3xl font-bold text-earth-900 mb-6">Help Center</h1>
      <div className="space-y-4">
        <div className="rounded-xl border border-earth-200 p-6">
          <h2 className="text-sm font-bold text-earth-900 mb-2">How do I buy a product?</h2>
          <p className="text-sm text-earth-600">Browse the <Link to="/marketplace" className="text-agro-600 hover:text-agro-700">Marketplace</Link>, click on a product, choose your quantity, and click &quot;Buy Now&quot; to place an order.</p>
        </div>
        <div className="rounded-xl border border-earth-200 p-6">
          <h2 className="text-sm font-bold text-earth-900 mb-2">How do I become a seller?</h2>
          <p className="text-sm text-earth-600">Click &quot;Sell on AgroConnect&quot; from your account menu, fill in your business details, and submit your application. An admin will review and approve it.</p>
        </div>
        <div className="rounded-xl border border-earth-200 p-6">
          <h2 className="text-sm font-bold text-earth-900 mb-2">How do payments work?</h2>
          <p className="text-sm text-earth-600">Payments are held securely until you confirm receipt of your order. Funds are then released to the seller.</p>
        </div>
        <div className="rounded-xl border border-earth-200 p-6">
          <h2 className="text-sm font-bold text-earth-900 mb-2">Can I cancel an order?</h2>
          <p className="text-sm text-earth-600">You can cancel an order while it&apos;s in &quot;pending&quot; status. Once confirmed, please contact the seller through messages.</p>
        </div>
      </div>
    </div>
  )
}
