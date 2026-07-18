import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting Payment',
  paid: 'Paid (Escrow Held)',
  escrow_held: 'In Escrow',
  escrow_released: 'Released to Seller',
  refunded: 'Refunded',
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchOrders = () => {
    setLoading(true)
    ;(supabase.from('orders') as any)
      .select('*, buyer:profiles!orders_buyer_id_fkey(full_name), seller:profiles!orders_seller_id_fkey(full_name)')
      .order('created_at', { ascending: false })
      .then((res: any) => {
        if (res.data) setOrders(res.data)
        setLoading(false)
      })
  }

  useEffect(() => { fetchOrders() }, [])

  const confirmPayment = async (order: any) => {
    const method = prompt('Payment method (e.g. mobile_money, bank_transfer):')
    if (!method) return
    const reference = prompt('Payment reference / transaction ID:')
    if (!reference) return
    setProcessing(order.id)
    const { data } = await (supabase.rpc as any)('confirm_payment', {
      p_order_id: order.id,
      p_payment_method: method,
      p_payment_reference: reference,
      p_platform_fee_rate: 5.00,
    })
    if (data?.error) { alert('Error: ' + data.error) }
    else { alert('Payment confirmed! Escrow held: GH₵ ' + Number(data?.escrow_amount).toFixed(2) + ', Fee: GH₵ ' + Number(data?.platform_fee).toFixed(2)) }
    setProcessing(null)
    fetchOrders()
  }

  const releasePayment = async (orderId: string) => {
    if (!confirm('Release escrow to seller? This will credit the seller\'s available balance.')) return
    setProcessing(orderId)
    const { data } = await (supabase.rpc as any)('release_payment', { p_order_id: orderId })
    if (data?.error) { alert('Error: ' + data.error) }
    else { alert('Payment released! Amount: GH₵ ' + Number(data?.released_amount).toFixed(2)) }
    setProcessing(null)
    fetchOrders()
  }

  const refundPayment = async (orderId: string) => {
    if (!confirm('Refund this payment? This will reverse the escrow hold.')) return
    setProcessing(orderId)
    const { data } = await (supabase.rpc as any)('refund_payment', { p_order_id: orderId })
    if (data?.error) { alert('Error: ' + data.error) }
    else { alert('Payment refunded!') }
    setProcessing(null)
    fetchOrders()
  }

  return (
    <div>
      <SeoHelmet title="Admin Orders" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-earth-900">Orders</h1>
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-earth-100" />)}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-earth-500">No orders yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-earth-200 bg-white">
          <table className="min-w-full divide-y divide-earth-200 text-sm">
            <thead className="bg-earth-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-earth-600">Order</th>
                <th className="px-4 py-3 text-left font-medium text-earth-600">Buyer</th>
                <th className="px-4 py-3 text-left font-medium text-earth-600">Seller</th>
                <th className="px-4 py-3 text-right font-medium text-earth-600">Total</th>
                <th className="px-4 py-3 text-center font-medium text-earth-600">Status</th>
                <th className="px-4 py-3 text-center font-medium text-earth-600">Payment</th>
                <th className="px-4 py-3 text-center font-medium text-earth-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-earth-50/50">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${order.id}`} className="text-agro-600 hover:text-agro-700 font-mono text-xs">
                      #{order.id.slice(0, 8)}
                    </Link>
                    <div className="text-xs text-earth-400">{new Date(order.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-3 text-earth-700">{order.buyer?.full_name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-earth-700">{order.seller?.full_name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-right font-medium">GH₵ {Number(order.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : order.status === 'delivered' ? 'bg-agro-100 text-agro-800' : 'bg-red-100 text-red-800'}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.payment_status === 'awaiting_payment' ? 'bg-orange-100 text-orange-800' : order.payment_status === 'paid' || order.payment_status === 'escrow_held' ? 'bg-blue-100 text-blue-800' : order.payment_status === 'escrow_released' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{PAYMENT_LABELS[order.payment_status] || order.payment_status}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {(order.payment_status === 'pending' || order.payment_status === 'awaiting_payment') && (
                        <Button size="sm" onClick={() => confirmPayment(order)} loading={processing === order.id}>Confirm Payment</Button>
                      )}
                      {(order.payment_status === 'paid' || order.payment_status === 'escrow_held') && order.status === 'delivered' && (
                        <Button size="sm" onClick={() => releasePayment(order.id)} loading={processing === order.id}>Release Escrow</Button>
                      )}
                      {(order.payment_status === 'paid' || order.payment_status === 'escrow_held') && (
                        <Button size="sm" variant="outline" onClick={() => refundPayment(order.id)} loading={processing === order.id}>Refund</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
