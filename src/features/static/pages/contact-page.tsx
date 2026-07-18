import { SeoHelmet } from '@/components/seo/helmet'

export function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <SeoHelmet title="Contact Us" />
      <h1 className="text-3xl font-bold text-earth-900 mb-6">Contact Us</h1>
      <div className="space-y-6">
        <p className="text-earth-600">Have a question, suggestion, or need help? Reach out to us.</p>
        <div className="rounded-xl border border-earth-200 p-6">
          <h2 className="text-sm font-bold text-earth-900 mb-3">Email</h2>
          <p className="text-sm text-earth-600"><a href="mailto:info@agroconnectgh.com" className="text-agro-600 hover:text-agro-700">info@agroconnectgh.com</a></p>
        </div>
        <div className="rounded-xl border border-earth-200 p-6">
          <h2 className="text-sm font-bold text-earth-900 mb-3">Location</h2>
          <p className="text-sm text-earth-600">Accra, Ghana</p>
        </div>
      </div>
    </div>
  )
}
