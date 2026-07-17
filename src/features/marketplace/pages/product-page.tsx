import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card } from '@/components/ui'
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
  const [reviews, setReviews] = useState<any[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [isFav, setIsFav] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewContent, setReviewContent] = useState('')
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    if (!slug) return
    ;(supabase.from('products') as any).select('*, profiles!inner(full_name)').eq('slug', slug).single().then((res: any) => {
      if (res.error || !res.data) { setLoading(false); return }
      setProduct(res.data)
      if (res.data.profiles) setSellerName(res.data.profiles.full_name)
      setLoading(false)
    })
  }, [slug])

  useEffect(() => {
    if (!product) return
    ;(supabase.from('reviews') as any).select('*, profiles(full_name)').eq('product_id', product.id).then((res: any) => {
      if (res.data) {
        setReviews(res.data)
        const avg = res.data.reduce((s: number, r: any) => s + r.rating, 0) / (res.data.length || 1)
        setAvgRating(Math.round(avg * 10) / 10)
      }
    })
    if (user) {
      ;(supabase.from('favorites') as any).select('id').eq('user_id', user.id).eq('product_id', product.id).maybeSingle().then((res: any) => {
        if (res.data) setIsFav(true)
      })
    }
  }, [product, user])

  const toggleFav = async () => {
    if (!user || !product) { navigate('/login'); return }
    if (isFav) {
      await (supabase.from('favorites') as any).delete().eq('user_id', user.id).eq('product_id', product.id)
      setIsFav(false)
    } else {
      await (supabase.from('favorites') as any).insert({ user_id: user.id, product_id: product.id })
      setIsFav(true)
    }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !product) return
    setReviewing(true)
    await (supabase.from('reviews') as any).insert({ product_id: product.id, reviewer_id: user.id, rating, content: reviewContent || null })
    setReviewContent('')
    setReviewing(false)
    // Refresh reviews
    ;(supabase.from('reviews') as any).select('*, profiles(full_name)').eq('product_id', product.id).then((res: any) => {
      if (res.data) {
        setReviews(res.data)
        const avg = res.data.reduce((s: number, r: any) => s + r.rating, 0) / (res.data.length || 1)
        setAvgRating(Math.round(avg * 10) / 10)
      }
    })
  }

  const placeOrder = async () => {
    if (!user || !product) { navigate('/login'); return }
    if (user.id === product.seller_id) { alert('You cannot order your own product.'); return }
    setOrdering(true)
    const total = Number(product.price) * qty
    const { data: order } = await (supabase.from('orders') as any).insert({ buyer_id: user.id, seller_id: product.seller_id, total, currency: 'GHS' }).select().single()
    if (!order) { setOrdering(false); return }
    await (supabase.from('order_items') as any).insert({ order_id: order.id, product_id: product.id, quantity: qty, unit_price: Number(product.price), total })
    await (supabase.from('conversations') as any).insert({ order_id: order.id, buyer_id: user.id, seller_id: product.seller_id })
    setOrdering(false)
    navigate(`/orders/${order.id}`)
  }

  const startConversation = async () => {
    if (!user || !product) { navigate('/login'); return }
    const { data: existing } = await (supabase.from('conversations') as any).select('*').eq('buyer_id', user.id).eq('seller_id', product.seller_id).maybeSingle()
    if (existing) { navigate(`/messages/${existing.id}`); return }
    const { data: conv } = await (supabase.from('conversations') as any).insert({ buyer_id: user.id, seller_id: product.seller_id }).select().single()
    if (conv) navigate(`/messages/${conv.id}`)
  }

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-earth-100 rounded w-1/3" /><div className="h-64 bg-earth-100 rounded" /><div className="h-4 bg-earth-100 rounded w-2/3" /></div></div>
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-8 text-center"><p className="text-earth-500 mb-4">Product not found.</p><Link to="/marketplace"><Button variant="outline">Back to Marketplace</Button></Link></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/marketplace" className="text-sm text-agro-600 hover:text-agro-700 mb-4 inline-block">&larr; Back to Marketplace</Link>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-square rounded-xl bg-earth-100 flex items-center justify-center text-earth-400 text-lg relative">
            {product.unit}
            <button onClick={toggleFav} className="absolute top-3 right-3 text-2xl">{isFav ? '❤️' : '🤍'}</button>
          </div>
          {/* Reviews section */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-earth-900 mb-4">Reviews ({reviews.length})</h2>
            {avgRating > 0 && <p className="text-sm text-earth-600 mb-4">Average: {avgRating} / 5</p>}
            {reviews.length === 0 ? (
              <p className="text-sm text-earth-500">No reviews yet.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r: any) => (
                  <Card key={r.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-earth-900">{r.profiles?.full_name || 'Anonymous'}</p>
                      <span className="text-sm text-yellow-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.content && <p className="text-sm text-earth-600">{r.content}</p>}
                  </Card>
                ))}
              </div>
            )}
            {user && user.id !== product.seller_id && (
              <form onSubmit={submitReview} className="mt-6 space-y-3">
                <h3 className="text-sm font-medium text-earth-900">Write a Review</h3>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded-lg border border-earth-300 px-3 py-1 text-sm">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5-n)}</option>)}
                </select>
                <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} placeholder="Your review (optional)" rows={3} className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500" />
                <Button type="submit" size="sm" loading={reviewing}>Submit Review</Button>
              </form>
            )}
          </div>
        </div>
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
              <input type="number" min={Number(product.min_order)} max={Number(product.stock)} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-24 rounded-lg border border-earth-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500" />
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
