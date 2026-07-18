import { SeoHelmet } from '@/components/seo/helmet'

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SeoHelmet title="Terms of Service" />
      <h1 className="text-3xl font-bold text-earth-900 mb-6">Terms of Service</h1>
      <div className="prose prose-earth max-w-none text-earth-600 leading-relaxed space-y-4">
        <p>By using AgroConnect GH, you agree to these terms. Our platform connects buyers and sellers for agricultural products. All transactions are between the buyer and seller; AgroConnect GH facilitates the connection and provides escrow payment processing.</p>
        <p>Sellers must provide accurate product descriptions and pricing. Buyers must ensure they have the legal capacity to enter into transactions. Any disputes should be raised through our support channels.</p>
        <p>We reserve the right to suspend accounts that violate our policies, including fraudulent activity, misrepresentation, or abuse of the platform.</p>
      </div>
    </div>
  )
}
