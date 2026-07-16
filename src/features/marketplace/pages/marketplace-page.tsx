import { Card, CardTitle } from '@/components/ui'

export function MarketplacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-earth-900 mb-8">Marketplace</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="aspect-square rounded-lg bg-earth-100 mb-4" />
            <CardTitle className="text-sm">Product Name</CardTitle>
            <p className="text-sm text-earth-600 mt-1">GH₵ 0.00</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
