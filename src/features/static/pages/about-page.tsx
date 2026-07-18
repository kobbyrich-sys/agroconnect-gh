import { SeoHelmet } from '@/components/seo/helmet'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SeoHelmet title="About Us" />
      <h1 className="text-3xl font-bold text-earth-900 mb-6">About AgroConnect GH</h1>
      <div className="prose prose-earth max-w-none">
        <p className="text-earth-600 leading-relaxed">AgroConnect GH is Ghana&apos;s digital agricultural marketplace, connecting farmers, processors, and buyers across the country. Our platform makes it easy to discover fresh produce, livestock, and farm equipment, with secure transactions and reliable delivery.</p>
        <h2 className="text-xl font-bold text-earth-900 mt-8 mb-3">Our Mission</h2>
        <p className="text-earth-600 leading-relaxed">To empower Ghanaian farmers by providing direct access to markets, fair pricing, and modern tools that eliminate intermediaries and maximize profits.</p>
        <h2 className="text-xl font-bold text-earth-900 mt-8 mb-3">Why AgroConnect GH?</h2>
        <ul className="space-y-2 text-earth-600">
          <li>🌾 <strong>Direct from farm</strong> — Buy fresh produce straight from growers</li>
          <li>💳 <strong>Secure payments</strong> — Escrow-protected transactions</li>
          <li>📦 <strong>Nationwide delivery</strong> — Connect with buyers and sellers across Ghana</li>
          <li>⭐ <strong>Verified sellers</strong> — Every seller is reviewed and approved</li>
        </ul>
      </div>
    </div>
  )
}
