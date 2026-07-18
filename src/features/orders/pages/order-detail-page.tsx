import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card, CardHeader, CardTitle } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'
import { OrderCardSkeleton } from '@/components/ui/skeleton'
import { payWithPaystack } from '@/lib/paystack'

const STATUS_FLOW: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: [],
  delivered: [],
  cancelled: [],
  refunded: [],
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting Payment',
  paid: 'Paid (Escrow Held)',
  escrow_held: 'In Escrow',
  escrow_released: 'Released to Seller',
  refunded: 'Refunded',
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  awaiting_payment: 'bg-gold-100 text-gold-800',
  paid: 'bg-blue-100 text-blue-800',
  escrow_held: 'bg-indigo-100 text-indigo-800',
  escrow_released: 'bg-agro-100 text-agro-800',
  refunded: 'bg-red-100 text-red-800',
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

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

  const handleReceived = async () => {
    if (!confirm('Confirm that you have received the goods and they are satisfactory?')) return
    setProcessing(true)
    const { data: deliveryData } = await (supabase.rpc as any)('confirm_delivery', { p_order_id: id })
    if (deliveryData?.error) { alert('Error: ' + deliveryData.error); setProcessing(false); return }
    setOrder({ ...order, status: 'delivered', delivered_at: new Date().toISOString() })
    const { data: escrowData } = await (supabase.rpc as any)('release_order_escrow', { p_order_id: id })
    if (escrowData?.error) { console.error('Escrow release failed:', escrowData.error) }
    setProcessing(false)
  }

  const handlePayWithPaystack = () => {
    if (!order || !profile || !user?.email) { alert('Email not available. Try signing out and back in.'); return }
    payWithPaystack({
      email: user.email,
      amount: Number(order.total),
      reference: 'AGRO-' + order.id.slice(0, 8) + '-' + Date.now(),
      metadata: { order_id: order.id },
      onSuccess: async (ref) => {
        const { data } = await (supabase.rpc as any)('confirm_paystack_payment', {
          p_order_id: order.id,
          p_reference: ref,
        })
        if (data?.error) {
          await (supabase.from('orders') as any).update({ payment_reference: ref, payment_status: 'awaiting_payment' }).eq('id', order.id)
          setOrder({ ...order, payment_reference: ref, payment_status: 'awaiting_payment' })
        } else {
          ;(supabase.from('orders') as any).select('*').eq('id', order.id).single().then((r: any) => {
            if (r.data) setOrder(r.data)
          })
        }
      },
    })
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><OrderCardSkeleton /></div>
  if (!order) return <div className="mx-auto max-w-3xl px-4 py-8 text-center"><p className="text-earth-500">Order not found. It may have been removed.</p></div>

  const isBuyer = profile?.id === order.buyer_id
  const isSeller = profile?.id === order.seller_id
  const nextStatuses = STATUS_FLOW[order.status] || []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Order Details" />
      <Link to="/orders" className="text-sm text-agro-600 hover:text-agro-700 mb-4 inline-block">&larr; Back to Orders</Link>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-earth-900">Order #{order.id.slice(0, 8)}</h1>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : order.status === 'delivered' ? 'bg-agro-100 text-agro-800' : order.status === 'refunded' ? 'bg-red-100 text-red-800' : 'bg-earth-100 text-earth-600'}`}>{order.status}</span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STATUS_COLORS[order.payment_status] || 'bg-earth-100 text-earth-600'}`}>
          {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
        </span>
      </div>

      {/* Order flow timeline */}
      <Card className="mb-6 p-6">
        <h3 className="text-sm font-semibold text-earth-900 mb-4">Order Progress</h3>
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto pb-1">
          {[
            { key: 'pending', label: 'Placed', done: true },
            { key: 'confirmed', label: 'Confirmed', done: ['confirmed','shipped','delivered'].includes(order.status) },
            { key: 'shipped', label: 'Shipped', done: ['shipped','delivered'].includes(order.status) },
            { key: 'delivered', label: 'Delivered', done: order.status === 'delivered' },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center flex-1 min-w-0">
              <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold ${s.done ? 'bg-agro-600 text-white' : order.status === s.key ? 'border-2 border-agro-600 text-agro-600' : 'border-2 border-earth-200 text-earth-400 bg-white'}`}>
                {s.done ? '✓' : i + 1}
              </div>
              <span className={`ml-1 sm:ml-1.5 text-[10px] sm:text-xs whitespace-nowrap ${s.done ? 'font-medium text-agro-700' : order.status === s.key ? 'font-medium text-agro-600' : 'text-earth-400'}`}>{s.label}</span>
              {i < 3 && <div className={`mx-1 sm:mx-2 h-px flex-1 ${['confirmed','shipped','delivered'].includes(order.status) && i < ['confirmed','shipped','delivered'].indexOf(order.status) + 1 ? 'bg-agro-300' : 'bg-earth-200'}`} />}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-0.5 sm:gap-1 overflow-x-auto pb-1">
          {(order.payment_status === 'refunded' ? [
            { key: 'pending', label: 'Pending' },
            { key: 'awaiting_payment', label: 'Awaiting Payment' },
            { key: 'paid', label: 'Paid (Escrow)', done: true },
            { key: 'refunded', label: 'Refunded', done: true, isRefund: true },
          ] : [
            { key: 'pending', label: 'Pending' },
            { key: 'awaiting_payment', label: 'Awaiting Payment' },
            { key: 'paid', label: 'Paid (Escrow)', done: ['paid','escrow_held','escrow_released','refunded'].includes(order.payment_status) },
            { key: 'escrow_released', label: 'Released to Seller', done: order.payment_status === 'escrow_released' },
          ]).map((s, i) => {
            const ps = order.payment_status
            const isDone = s.done || (s.key === 'pending') || (s.key === 'awaiting_payment' && ['awaiting_payment','paid','escrow_held','escrow_released','refunded'].includes(ps)) || (s.key === 'paid' && ['paid','escrow_held','escrow_released','refunded'].includes(ps))
            const isCurrent = !s.done && !s.isRefund && ps === s.key
            const steps = ['pending','awaiting_payment','paid','escrow_held','escrow_released','refunded']
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDone ? 'bg-agro-600 text-white' : isCurrent ? 'border-2 border-agro-600 text-agro-600' : 'border-2 border-earth-200 text-earth-400 bg-white'}`}>
                  {isDone ? '✓' : isCurrent ? '●' : i + 1}
                </div>
                <span className={`ml-1.5 text-xs ${isDone ? 'font-medium text-agro-700' : isCurrent ? 'font-medium text-agro-600' : 'text-earth-400'}`}>{s.label}</span>
                {i < 3 && <div className={`mx-2 h-px flex-1 ${steps.indexOf(ps) > i ? 'bg-agro-300' : 'bg-earth-200'}`} />}
              </div>
            )
          })}
        </div>
      </Card>

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

      <Card className="mb-6">
        <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
        <div className="px-6 pb-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-earth-500">Payment Status</span><span className="font-medium">{PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}</span></div>
          {order.payment_method && <div className="flex justify-between"><span className="text-earth-500">Method</span><span className="font-medium capitalize">{order.payment_method.replace('_', ' ')}</span></div>}
          {order.payment_reference && <div className="flex justify-between"><span className="text-earth-500">Reference</span><span className="font-medium">{order.payment_reference}</span></div>}
          {order.paid_at && <div className="flex justify-between"><span className="text-earth-500">Paid At</span><span className="font-medium">{new Date(order.paid_at).toLocaleDateString()}</span></div>}
          {order.platform_fee && <div className="flex justify-between"><span className="text-earth-500">Platform Fee ({order.platform_fee_rate}%)</span><span className="font-medium">GH₵ {Number(order.platform_fee).toFixed(2)}</span></div>}
          {order.escrow_released_at && <div className="flex justify-between"><span className="text-earth-500">Released At</span><span className="font-medium">{new Date(order.escrow_released_at).toLocaleDateString()}</span></div>}
        </div>
      </Card>

      {order.status === 'refunded' && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader><CardTitle className="text-red-800">Order Refunded</CardTitle></CardHeader>
          <div className="px-6 pb-6 text-sm text-red-700 space-y-2">
            <p>This order has been refunded. The full amount of <strong>GH₵ {Number(order.total).toFixed(2)}</strong> has been credited to your wallet.</p>
            <p>You can withdraw the funds from your <Link to="/wallet" className="text-agro-600 hover:text-agro-700 underline">wallet</Link> or use them towards your next purchase.</p>
          </div>
        </Card>
      )}

      {order.notes && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <p className="px-6 pb-6 text-sm text-earth-600">{order.notes}</p>
        </Card>
      )}

      {nextStatuses.length > 0 && (isSeller || (isBuyer && order.status === 'pending')) && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-earth-900 mb-3">Update Status</h3>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <Button key={s} size="sm" onClick={() => updateStatus(s)} className="capitalize">
                {s === 'cancelled' ? 'Cancel Order' : `Mark as ${s}`}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {isBuyer && order.status === 'shipped' && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-earth-900 mb-3">Confirm Delivery</h3>
          <p className="text-sm text-earth-600 mb-3">Confirm delivery to release the escrow payment to the seller automatically.</p>
          <Button onClick={handleReceived} loading={processing}>I Have Received the Goods</Button>
        </Card>
      )}

      {isBuyer && order.payment_status === 'pending' && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-earth-900 mb-3">Pay with Paystack</h3>
          <p className="text-sm text-earth-600 mb-3">Pay securely via Mobile Money, Card, or Bank Transfer using Paystack.</p>
          <p className="text-xs text-earth-400 mb-3">Amount: GH₵ {Number(order.total).toFixed(2)}</p>
          <Button onClick={handlePayWithPaystack}>Pay Now</Button>
        </Card>
      )}

      {isBuyer && order.payment_status === 'awaiting_payment' && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-earth-900 mb-3">Payment Pending</h3>
          <p className="text-sm text-earth-600">Your payment reference <strong>{order.payment_reference}</strong> has been submitted. Payment will be confirmed automatically by Paystack.</p>
        </Card>
      )}

      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={() => navigate(`/messages?order=${order.id}`)}>Contact {isBuyer ? 'Seller' : 'Buyer'}</Button>
      </div>
    </div>
  )
}
