import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

export function AdminDashboard() {
  const [stats, setStats] = useState<any>({ users: 0, products: 0, orders: 0, revenue: 0, pendingSellers: 0, pendingWithdrawals: 0 })
  const [orderStatuses, setOrderStatuses] = useState<any[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      (supabase.from('profiles') as any).select('*', { count: 'exact', head: true }),
      (supabase.from('products') as any).select('*', { count: 'exact', head: true }).eq('status', 'active'),
      (supabase.from('orders') as any).select('*', { count: 'exact', head: true }),
      (supabase.from('orders') as any).select('total').eq('payment_status', 'escrow_released'),
      (supabase.from('seller_applications') as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      (supabase.from('withdrawal_requests') as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      (supabase.from('orders') as any).select('status, count').then((r: any) => {
        if (r.data) {
          const counts: Record<string, number> = {}
          r.data.forEach((o: any) => { counts[o.status] = (counts[o.status] || 0) + 1 })
          setOrderStatuses(Object.entries(counts).map(([status, count]) => ({ status, count })))
        }
      }),
      (supabase.from('orders') as any).select('created_at, total').gte('created_at', new Date(Date.now() - 90 * 86400000).toISOString()).then((r: any) => {
        if (r.data) {
          const byMonth: Record<string, number> = {}
          r.data.forEach((o: any) => {
            const m = new Date(o.created_at).toLocaleString('default', { month: 'short', year: '2-digit' })
            byMonth[m] = (byMonth[m] || 0) + Number(o.total)
          })
          setMonthlyRevenue(Object.entries(byMonth).map(([month, total]) => ({ month, total })))
        }
      }),
      (supabase.from('orders') as any).select('*, buyer:profiles!orders_buyer_id_fkey(full_name)').order('created_at', { ascending: false }).limit(5).then((r: any) => {
        if (r.data) setRecentOrders(r.data)
      }),
    ]).then(([users, products, orders, revenue, sellers, withdrawals]) => {
      const rev = revenue.data?.reduce((s: number, o: any) => s + Number(o.total), 0) || 0
      setStats({
        users: users.count || 0,
        products: products.count || 0,
        orders: orders.count || 0,
        revenue: rev,
        pendingSellers: sellers.count || 0,
        pendingWithdrawals: withdrawals.count || 0,
      })
      setLoading(false)
    })
  }, [])

  const orderChartData = {
    labels: orderStatuses.map(s => s.status.charAt(0).toUpperCase() + s.status.slice(1)),
    datasets: [{ data: orderStatuses.map(s => s.count),     backgroundColor: ['#D98C10', '#2563EB', '#a855f7', '#2E8B57', '#DC2626', '#64748B'], borderWidth: 0 }],
  }

  const revenueChartData = {
    labels: monthlyRevenue.map(m => m.month),
    datasets: [{
      label: 'Revenue (GHS)',
      data: monthlyRevenue.map(m => m.total),
      borderColor: '#084C31',
      backgroundColor: 'rgba(8,76,49,0.1)',
      fill: true,
      tension: 0.4,
    }],
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-agro-100 text-agro-800',
    cancelled: 'bg-red-100 text-red-800', refunded: 'bg-red-100 text-red-800',
  }

  return (
    <div>
      <SeoHelmet title="Admin Dashboard" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-6">
        <Card><CardHeader><CardTitle className="text-xs text-earth-500">Users</CardTitle><p className="text-xl font-bold text-earth-900 mt-1">{stats.users}</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-xs text-earth-500">Products</CardTitle><p className="text-xl font-bold text-earth-900 mt-1">{stats.products}</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-xs text-earth-500">Orders</CardTitle><p className="text-xl font-bold text-earth-900 mt-1">{stats.orders}</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-xs text-earth-500">Revenue</CardTitle><p className="text-xl font-bold text-agro-700 mt-1">GH₵ {stats.revenue.toFixed(0)}</p></CardHeader></Card>
        <Link to="/admin/sellers"><Card className="hover:shadow-md transition-shadow"><CardHeader><CardTitle className="text-xs text-earth-500">Pending Sellers</CardTitle><p className="text-xl font-bold text-earth-900 mt-1">{stats.pendingSellers}</p></CardHeader></Card></Link>
        <Link to="/admin/withdrawals"><Card className="hover:shadow-md transition-shadow"><CardHeader><CardTitle className="text-xs text-earth-500">Pending Withdrawals</CardTitle><p className="text-xl font-bold text-earth-900 mt-1">{stats.pendingWithdrawals}</p></CardHeader></Card></Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg bg-earth-100" />
          <div className="h-64 animate-pulse rounded-lg bg-earth-100" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {orderStatuses.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-earth-900 mb-4">Order Status Distribution</h3>
              <div className="flex items-center justify-center h-48">
                <Doughnut data={orderChartData} options={{ cutout: '60%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 10, font: { size: 11 } } } } }} />
              </div>
            </Card>
          )}
          {monthlyRevenue.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-earth-900 mb-4">Monthly Revenue (90 days)</h3>
              <div className="h-48">
                <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v: any) => 'GH₵' + v } } } }} />
              </div>
            </Card>
          )}
        </div>
      )}

      <h3 className="text-lg font-semibold text-earth-900 mt-8 mb-4">Recent Orders</h3>
      {recentOrders.length === 0 ? (
        <div className="rounded-lg border border-earth-200 p-6 text-center text-earth-500">No orders yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-earth-200 bg-white">
          <table className="min-w-full divide-y divide-earth-200 text-sm">
            <thead className="bg-earth-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-earth-600">Order</th>
                <th className="px-4 py-2 text-left font-medium text-earth-600">Buyer</th>
                <th className="px-4 py-2 text-right font-medium text-earth-600">Total</th>
                <th className="px-4 py-2 text-center font-medium text-earth-600">Status</th>
                <th className="px-4 py-2 text-center font-medium text-earth-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {recentOrders.map((o: any) => (
                <tr key={o.id} className="hover:bg-earth-50/50">
                  <td className="px-4 py-2"><Link to={`/orders/${o.id}`} className="text-agro-600 hover:text-agro-700 font-mono">#{o.id.slice(0, 8)}</Link></td>
                  <td className="px-4 py-2 text-earth-700">{o.buyer?.full_name || 'Unknown'}</td>
                  <td className="px-4 py-2 text-right font-medium">GH₵ {Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-2 text-center"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[o.status] || 'bg-earth-100 text-earth-600'}`}>{o.status}</span></td>
                  <td className="px-4 py-2 text-center text-earth-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
