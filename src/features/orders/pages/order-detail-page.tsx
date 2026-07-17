import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card, CardHeader, CardTitle } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'
import { OrderCardSkeleton } from '@/components/ui/skeleton'

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  refunded: [],
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(supabase.from('orders') as any).select('*').eq('id', id).single().then((res: any) => {
      if (res.data) {
        setOrder(res.data)
        ;(supabase.from('order_items') as any).select('*, products(name)').eq('order_id', id).then((r: any) => {
          if (r.data) setItems(r.data)
          setLoading(false)
        })
      } else { setLoading(false) }
    })
  }, [id])

  const updateStatus = async (status: string) => {
    ;(supabase.from('orders') as any).update({ status }).eq('id', id).then(() => {
      setOrder({ ...order, status })
    })
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><OrderCardSkeleton /></div>
  if (!order) return <div className="mx-auto max-w-3xl px-4 py-8 text-center"><p className="text-earth-500">📋 Order not found. It may have been removed.</p></div>

  const isBuyer = profile?.id === order.buyer_id
  const isSeller = profile?.id === order.seller_id
  const nextStatuses = STATUS_FLOW[order.status] || []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Order Details" />
      <Link to="/orders" className="text-sm text-agro-600 hover:text-agro-700 mb-4 inline-block">&larr; Back to Orders</Link>
      <h1 className="text-2xl font-bold text-earth-900 mb-2">Order #{order.id.slice(0, 8)}</h1>
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize mb-6 ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : order.status === 'delivered' ? 'bg-agro-100 text-agro-800' : 'bg-red-100 text-red-800'}`}>{order.status}</span>

      <Card className="mb-6">
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <div className="divide-y divide-earth-100 px-6 pb-6">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-earth-900">{item.products?.name || 'Product'}</p>
                <p className="text-xs text-earth-500">{Number(item.quantity)} x GH₵ {Number(item.unit_price).toFixed(2)}</p>
              </div>
              <p className="text-sm font-medium text-earth-900">GH₵ {Number(item.total).toFixed(2)}</p>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 font-medium">
            <p className="text-sm text-earth-900">Total</p>
            <p className="text-sm text-agro-700">GH₵ {Number(order.total).toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {order.notes && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <p className="px-6 pb-6 text-sm text-earth-600">{order.notes}</p>
        </Card>
      )}

      {nextStatuses.length > 0 && (isSeller || (isBuyer && order.status === 'pending')) && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-earth-900 mb-3">Update Status</h3>
          <div className="flex gap-2">
            {nextStatuses.map((s) => (
              <Button key={s} size="sm" onClick={() => updateStatus(s)} className="capitalize">
                {s === 'cancelled' ? 'Cancel Order' : `Mark as ${s}`}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-4">
        <Button variant="outline" onClick={() => navigate(`/messages?order=${order.id}`)}>Contact Seller</Button>
      </div>
    </div>
  )
}
