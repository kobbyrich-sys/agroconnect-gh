import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card, CardHeader, CardTitle } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { SeoHelmet } from '@/components/seo/helmet'

type DashboardStats = {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  revenue: number
  pendingOrders: number
}

type MonthlySales = {
  month: string
  total: number
}

type TopProduct = {
  id: string
  name: string
  total_qty: number
  total_revenue: number
}

export function SellerDashboardPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    ;(async () => {
      const sellerId = profile.id

      const [productsRes, ordersRes, itemsRes] = await Promise.all([
        supabase.from('products').select('id, status').eq('seller_id', sellerId),
        supabase.from('orders').select('id, status, total, created_at').eq('seller_id', sellerId).order('created_at', { ascending: false }),
        supabase.from('order_items').select('product_id, quantity, unit_price, total, products!inner(name)').eq('products.seller_id', sellerId),
      ])

      const allProducts = (productsRes.data || []) as any[]
      const allOrders = (ordersRes.data || []) as any[]

      setStats({
        totalProducts: allProducts.length,
        activeProducts: allProducts.filter((p: any) => p.status === 'active').length,
        totalOrders: allOrders.length,
        revenue: allOrders.filter((o: any) => o.status === 'delivered').reduce((sum: number, o: any) => sum + Number(o.total), 0),
        pendingOrders: allOrders.filter((o: any) => o.status === 'pending' || o.status === 'confirmed').length,
      })

      setRecentOrders(allOrders.slice(0, 5))

      const byMonth: Record<string, number> = {}
      allOrders.filter((o: any) => o.status === 'delivered').forEach((o: any) => {
        const key = new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        byMonth[key] = (byMonth[key] || 0) + Number(o.total)
      })
      setMonthlySales(Object.entries(byMonth).map(([month, total]) => ({ month, total })))

      const productMap = new Map<string, { name: string; qty: number; rev: number }>()
      ;(itemsRes.data || []) as any[]
      ;(itemsRes.data || []).forEach((item: any) => {
        const name = (item.products as any)?.name || 'Unknown'
        if (!productMap.has(item.product_id)) {
          productMap.set(item.product_id, { name, qty: 0, rev: 0 })
        }
        const p = productMap.get(item.product_id)!
        p.qty += Number(item.quantity)
        p.rev += Number(item.total)
      })
      setTopProducts(
        Array.from(productMap.entries())
          .map(([id, v]) => ({ id, name: v.name, total_qty: v.qty, total_revenue: v.rev }))
          .sort((a, b) => b.total_qty - a.total_qty)
          .slice(0, 5)
      )

      setLoading(false)
    })()
  }, [profile?.id])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-earth-100" />)}
        </div>
      </div>
    )
  }

  const maxSale = Math.max(...monthlySales.map(m => m.total), 1)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Seller Dashboard" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-earth-900">Seller Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/seller/products"><Button variant="outline">My Products</Button></Link>
          <Link to="/seller/products/new"><Button>Add Product</Button></Link>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-earth-500">Total Products</CardTitle>
              <p className="text-3xl font-bold text-earth-900">{stats.totalProducts}</p>
              <p className="text-xs text-agro-600">{stats.activeProducts} active</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-earth-500">Total Orders</CardTitle>
              <p className="text-3xl font-bold text-earth-900">{stats.totalOrders}</p>
              <p className="text-xs text-yellow-600">{stats.pendingOrders} pending</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-earth-500">Revenue</CardTitle>
              <p className="text-3xl font-bold text-agro-700">GH₵ {stats.revenue.toFixed(2)}</p>
              <p className="text-xs text-earth-500">from delivered orders</p>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          {monthlySales.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-earth-500">No sales data yet.</p>
          ) : (
            <div className="px-6 pb-6">
              <div className="flex items-end gap-2 h-32">
                {monthlySales.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-earth-500">GH₵{m.total.toFixed(0)}</span>
                    <div
                      className="w-full rounded-t bg-agro-500 hover:bg-agro-600 transition-colors"
                      style={{ height: `${(m.total / maxSale) * 100}%`, minHeight: m.total > 0 ? '4px' : '0' }}
                    />
                    <span className="text-[10px] text-earth-500 truncate w-full text-center">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          {topProducts.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-earth-500">No products sold yet.</p>
          ) : (
            <div className="divide-y divide-earth-100">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium text-earth-400 w-5">{i + 1}.</span>
                    <span className="text-sm font-medium text-earth-900 truncate">{p.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm text-earth-700">{p.total_qty} sold</p>
                    <p className="text-xs text-earth-500">GH₵ {p.total_revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        {recentOrders.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-earth-500">No orders yet.</p>
        ) : (
          <div className="divide-y divide-earth-100">
            {recentOrders.map((order: any) => (
              <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between px-6 py-3 hover:bg-earth-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-earth-900">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-earth-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-earth-700">GH₵ {Number(order.total).toFixed(2)}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    order.status === 'delivered' ? 'bg-agro-100 text-agro-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
