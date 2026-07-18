import { SeoHelmet } from '@/components/seo/helmet'

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <SeoHelmet title="Privacy Policy" />
      <h1 className="text-3xl font-bold text-earth-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-earth max-w-none text-earth-600 leading-relaxed space-y-4">
        <p>AgroConnect GH respects your privacy. We collect only the information necessary to provide our marketplace services:</p>
        <ul><li>Account information (name, email, phone)</li><li>Business details for seller applications</li><li>Transaction records for order processing</li></ul>
        <p>We do not share your personal information with third parties except as required to process transactions or comply with legal obligations. Your data is stored securely and you may request deletion of your account at any time.</p>
      </div>
    </div>
  )
}
