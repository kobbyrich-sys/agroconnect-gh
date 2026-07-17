import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui'
import type { Product } from '@/types/database'

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [sellerName, setSellerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    if (!slug) return
    ;(supabase.from('products') as any).select('*, profiles!inner(full_name)').eq('slug', slug).single().then((res: any) => {
      if (res.error || !res.data) { setLoading(false); return }
      setProduct(res.data)
      if (res.data.profiles) setSellerName(res.data.profiles.full_name)
      setLoading(false)
    })
  }, [slug])

  const placeOrder = async () => {
    if (!user || !product) return
    if (user.id === product.seller_id) { alert('You cannot order your own product.'); return }
    setOrdering(true)
    const total = Number(product.price) * qty
    const { data: order, error } = await (supabase.from('orders') as any).insert({
      buyer_id: user.id,
      seller_id: product.seller_id,
      total,
      currency: 'GHS',
    }).select().single()
    if (error || !order) { setOrdering(false); return }
    await (supabase.from('order_items') as any).insert({
      order_id: order.id,
      product_id: product.id,
      quantity: qty,
      unit_price: Number(product.price),
      total,
    })
    await (supabase.from('conversations') as any).insert({
      order_id: order.id,
      buyer_id: user.id,
      seller_id: product.seller_id,
    })
    setOrdering(false)
    navigate(`/orders/${order.id}`)
  }

  const startConversation = async () => {
    if (!user || !product) { navigate('/login'); return }
    const { data: existing } = await (supabase.from('conversations') as any)
      .select('*').eq('buyer_id', user.id).eq('seller_id', product.seller_id).maybeSingle()
    if (existing) { navigate(`/messages/${existing.id}`); return }
    const { data: conv } = await (supabase.from('conversations') as any).insert({
      buyer_id: user.id, seller_id: product.seller_id,
    }).select().single()
    if (conv) navigate(`/messages/${conv.id}`)
  }

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-earth-100 rounded w-1/3" /><div className="h-64 bg-earth-100 rounded" /><div className="h-4 bg-earth-100 rounded w-2/3" /></div></div>
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-center"><p className="text-earth-500 mb-4">Product not found.</p><Link to="/marketplace"><Button variant="outline">Back to Marketplace</Button></Link></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/marketplace" className="text-sm text-agro-600 hover:text-agro-700 mb-4 inline-block">&larr; Back to Marketplace</Link>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-xl bg-earth-100 flex items-center justify-center text-earth-400 text-lg">{product.unit}</div>
        <div>
          <h1 className="text-2xl font-bold text-earth-900">{product.name}</h1>
          <p className="text-3xl font-bold text-agro-700 mt-4">GH₵ {Number(product.price).toFixed(2)} / {product.unit}</p>
          <p className="text-sm text-earth-500 mt-2">Min order: {Number(product.min_order)} {product.unit}(s)</p>
          <p className="text-sm text-earth-500 mb-4">Stock: {Number(product.stock)} {product.unit}(s)</p>
          <p className="text-earth-600 leading-relaxed">{product.description}</p>
          {sellerName && (
            <div className="mt-6 border-t border-earth-200 pt-6">
              <h2 className="text-sm font-medium text-earth-900 mb-2">Seller</h2>
              <p className="text-earth-700">{sellerName}</p>
            </div>
          )}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-earth-700">Quantity ({product.unit}):</label>
              <input type="number" min={Number(product.min_order)} max={Number(product.stock)} value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-24 rounded-lg border border-earth-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500" />
              <span className="text-sm text-earth-600">= GH₵ {(Number(product.price) * qty).toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" loading={ordering} onClick={placeOrder} disabled={!user || user.id === product.seller_id}>
              {!user ? 'Sign In to Buy' : user.id === product.seller_id ? 'Your Product' : 'Buy Now'}
            </Button>
            <Button variant="outline" className="w-full" size="lg" onClick={startConversation}>Contact Seller</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
