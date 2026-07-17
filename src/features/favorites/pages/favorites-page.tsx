import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Card } from '@/components/ui'
import { ProductCard } from '@/features/marketplace/components/product-card'
import type { Product } from '@/types/database'

export function FavoritesPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    ;(supabase.from('favorites') as any).select('products(*)').eq('user_id', user.id).then((res: any) => {
      if (res.data) setProducts(res.data.map((f: any) => f.products))
      setLoading(false)
    })
  }, [user])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-earth-900 mb-6">My Favorites</h1>
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-64 animate-pulse rounded-xl bg-earth-100" />)}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-earth-500 mb-4">You haven&apos;t saved any products yet.</p>
          <Link to="/marketplace" className="text-sm text-agro-600 hover:text-agro-700">Browse Marketplace</Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
