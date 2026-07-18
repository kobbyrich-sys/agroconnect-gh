import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Card } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/features/marketplace/components/product-card'
import type { Product } from '@/types/database'

export function FavoritesPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    ;(supabase.from('favorites') as any).select('products(*)').eq('user_id', user.id).then(async (res: any) => {
      if (res.data) {
        const pids = res.data.map((f: any) => f.products?.id).filter(Boolean)
        if (pids.length) {
          const { data: imgs } = await (supabase.from('product_images') as any).select('product_id, url').in('product_id', pids).order('sort_order')
          const imgMap: Record<string, string> = {}
          if (imgs) imgs.forEach((i: any) => { if (!imgMap[i.product_id]) imgMap[i.product_id] = i.url })
          res.data.forEach((f: any) => {
            if (f.products && imgMap[f.products.id]) f.products.product_images = [{ url: imgMap[f.products.id] }]
          })
        }
        setProducts(res.data.map((f: any) => f.products))
      }
      setLoading(false)
    })
  }, [user])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Favorites" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">My Favorites</h1>
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4].map(i => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-earth-500 mb-4">❤️ You haven&apos;t saved any products yet. Tap the heart on a product to add it here!</p>
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
