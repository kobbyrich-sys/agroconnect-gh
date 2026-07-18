import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { SeoHelmet } from '@/components/seo/helmet'
import { ProductCard } from '@/features/marketplace/components/product-card'
import { ProductCardSkeleton } from '@/components/ui/skeleton'

export function SellerStorePage() {
  const { id } = useParams<{ id: string }>()
  const [sellerName, setSellerName] = useState('')
  const [profileData, setProfileData] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      (supabase.from('profiles') as any).select('*').eq('id', id).single().then((res: any) => {
        if (res.data) { setSellerName(res.data.full_name); setProfileData(res.data) }
      }),
      (supabase.from('products') as any).select('*, product_images(url)').eq('seller_id', id).eq('status', 'active').order('created_at', { ascending: false }).then((res: any) => {
        if (res.data) setProducts(res.data)
      }),
    ]).then(() => setLoading(false))
  }, [id])

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8"><div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[1,2,3,4].map(i => <ProductCardSkeleton key={i} />)}</div></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title={sellerName || 'Seller Store'} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-earth-900">{sellerName || 'Seller Store'}</h1>
        {profileData?.location && <p className="text-sm text-earth-500 mt-1">{profileData.location}</p>}
        {profileData?.bio && <p className="text-sm text-earth-600 mt-2 max-w-2xl">{profileData.bio}</p>}
      </div>
      {products.length === 0 ? (
        <div className="py-16 text-center"><p className="text-earth-500">🌾 No products listed yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
