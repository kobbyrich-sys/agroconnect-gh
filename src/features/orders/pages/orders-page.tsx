import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Card } from '@/components/ui'
import { OrderCardSkeleton } from '@/components/ui/skeleton'
import { SeoHelmet } from '@/components/seo/helmet'

export function OrdersPage() {
  const { profile } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'buying' | 'selling'>('buying')

  useEffect(() => {
    if (!profile?.id) return
    const column = tab === 'buying' ? 'buyer_id' : 'seller_id'
    setLoading(true)
    ;(supabase.from('orders') as any).select('*, products:order_items(product_id, quantity, unit_price, total, products(name))').eq(column, profile.id).order('created_at', { ascending: false }).then((res: any) => {
      if (res.data) setOrders(res.data)
      setLoading(false)
    })
  }, [profile?.id, tab])

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-agro-100 text-agro-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-earth-100 text-earth-600',
  }

  const paymentStatusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    awaiting_payment: 'bg-orange-100 text-orange-800',
    paid: 'bg-blue-100 text-blue-800',
    escrow_held: 'bg-indigo-100 text-indigo-800',
    escrow_released: 'bg-green-100 text-green-800',
    refunded: 'bg-red-100 text-red-800',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Orders" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Orders</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('buying')} className={`text-sm font-medium pb-1 border-b-2 ${tab === 'buying' ? 'border-agro-600 text-agro-700' : 'border-transparent text-earth-500'}`}>Buying</button>
        <button onClick={() => setTab('selling')} className={`text-sm font-medium pb-1 border-b-2 ${tab === 'selling' ? 'border-agro-600 text-agro-700' : 'border-transparent text-earth-500'}`}>Selling</button>
      </div>
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <OrderCardSkeleton key={i} />)}</div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-4xl mb-3">{tab === 'buying' ? '🛒' : '📦'}</p>
          <p className="text-lg font-medium text-earth-700 mb-1">No {tab} orders yet</p>
          <p className="text-sm text-earth-500">{tab === 'buying' ? 'Browse the marketplace to place your first order.' : 'Your products haven\'t received any orders yet.'}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-earth-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-earth-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-earth-700 mt-1">GH₵ {Number(order.total).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[order.status] || 'bg-earth-100 text-earth-600'}`}>{order.status}</span>
                    {order.payment_status && <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusColor[order.payment_status] || 'bg-earth-100 text-earth-600'}`}>{order.payment_status.replace('_', ' ')}</span>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
