import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'
import type { Product } from '@/types/database'

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [sellerName, setSellerName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase.from('products').select('*, profiles!inner(full_name)').eq('slug', slug).single().then(({ data, error }: { data: any; error: any }) => {
      if (error || !data) {
        setLoading(false)
        return
      }
      setProduct(data)
      if (data.profiles) setSellerName(data.profiles.full_name)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-earth-100 rounded w-1/3" />
          <div className="h-64 bg-earth-100 rounded" />
          <div className="h-4 bg-earth-100 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center">
        <p className="text-earth-500 mb-4">Product not found.</p>
        <Link to="/marketplace"><Button variant="outline">Back to Marketplace</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/marketplace" className="text-sm text-agro-600 hover:text-agro-700 mb-4 inline-block">&larr; Back to Marketplace</Link>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-xl bg-earth-100 flex items-center justify-center text-earth-400 text-lg">
          {product.unit}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-earth-900">{product.name}</h1>
          <p className="text-3xl font-bold text-agro-700 mt-4">GH₵ {Number(product.price).toFixed(2)} / {product.unit}</p>
          <p className="text-sm text-earth-500 mt-2">Min order: {Number(product.min_order)} {product.unit}(s)</p>
          <p className="text-sm text-earth-500">Stock: {product.stock} {product.unit}(s)</p>
          <p className="text-earth-600 mt-6 leading-relaxed">{product.description}</p>
          {sellerName && (
            <div className="mt-8 border-t border-earth-200 pt-6">
              <h2 className="text-sm font-medium text-earth-900 mb-2">Seller</h2>
              <p className="text-earth-700">{sellerName}</p>
            </div>
          )}
          <Button className="mt-6 w-full" size="lg">Contact Seller</Button>
        </div>
      </div>
    </div>
  )
}
