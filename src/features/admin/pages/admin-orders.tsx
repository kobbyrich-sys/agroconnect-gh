import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, Button } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    ;(supabase.from('orders') as any).select('*, buyer:profiles!buyer_id(full_name), seller:profiles!seller_id(full_name)').order('created_at', { ascending: false }).then((res: any) => {
      if (res.data) setOrders(res.data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Admin - Orders" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Orders</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-earth-100" />)}</div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-earth-500">📦 No orders yet.</p></Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-earth-200">
          <table className="w-full text-sm">
            <thead className="bg-earth-50 text-left">
              <tr><th className="px-4 py-3 font-medium text-earth-600">ID</th><th className="px-4 py-3 font-medium text-earth-600">Buyer</th><th className="px-4 py-3 font-medium text-earth-600">Seller</th><th className="px-4 py-3 font-medium text-earth-600">Total</th><th className="px-4 py-3 font-medium text-earth-600">Status</th><th className="px-4 py-3 font-medium text-earth-600">Date</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-earth-200">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-earth-50">
                  <td className="px-4 py-3 text-earth-600 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-earth-900">{o.buyer?.full_name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-earth-900">{o.seller?.full_name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-earth-900">GH₵ {Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${o.status === 'delivered' ? 'bg-agro-100 text-agro-800' : o.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-earth-600">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><Link to={`/orders/${o.id}`}><Button size="sm" variant="outline">View</Button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
