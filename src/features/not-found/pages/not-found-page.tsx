import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
      <SeoHelmet title="404 - Page Not Found" />
      <span className="text-7xl">🔍</span>
      <h1 className="mt-6 text-3xl font-bold text-earth-900">Page Not Found</h1>
      <p className="mt-2 text-earth-600">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="mt-8">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
