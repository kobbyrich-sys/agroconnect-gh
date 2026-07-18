import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { CartContext } from '@/features/cart/contexts/cart-context'
import { Button, Card } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'
import { getImageUrl } from '@/lib/storage'

export function CartPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, total, updateQuantity, removeItem, clearCart } = useContext(CartContext)!
  const [ordering, setOrdering] = useState(false)

  const checkout = async () => {
    if (!user) { navigate('/login'); return }
    if (items.length === 0) return
    setOrdering(true)
    const orderTotal = total
    const first = items[0]
    const { data: order, error } = await (supabase.from('orders') as any).insert({
      buyer_id: user.id,
      seller_id: first.sellerId,
      total: orderTotal,
      currency: 'GHS',
      payment_status: 'pending',
    }).select().single()
    if (error || !order) { setOrdering(false); return alert('Failed to create order') }
    for (const item of items) {
      await (supabase.from('order_items') as any).insert({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity,
      })
    }
    await (supabase.from('conversations') as any).insert({
      order_id: order.id,
      buyer_id: user.id,
      seller_id: first.sellerId,
    })
    clearCart()
    setOrdering(false)
    navigate(`/orders/${order.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Cart" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Shopping Cart</h1>
      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-earth-500 mb-4">🛒 Your cart is empty.</p>
          <Link to="/marketplace"><Button variant="outline">Browse Marketplace</Button></Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.productId} className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-earth-100">
                  {item.imageUrl ? <img src={getImageUrl('product-images', item.imageUrl)!} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-earth-400 text-xs">{item.unit}</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-earth-900 truncate">{item.name}</p>
                  <p className="text-sm text-earth-600">GH₵ {item.price.toFixed(2)} / {item.unit}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <select value={item.quantity} onChange={(e) => updateQuantity(item.productId, Number(e.target.value))} className="rounded border border-earth-300 px-2 py-1 text-xs">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="text-xs text-earth-500">× GH₵ {item.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-earth-900">GH₵ {(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeItem(item.productId)} className="text-xs text-red-500 hover:text-red-700 mt-1">Remove</button>
                </div>
              </div>
            </Card>
          ))}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-earth-900">Total</p>
              <p className="text-lg font-bold text-agro-700">GH₵ {total.toFixed(2)}</p>
            </div>
            <Button className="mt-4 w-full" size="lg" loading={ordering} onClick={checkout}>Proceed to Checkout</Button>
          </Card>
        </div>
      )}
    </div>
  )
}
