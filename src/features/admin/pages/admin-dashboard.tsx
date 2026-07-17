import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle } from '@/components/ui'

export function AdminDashboard() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    Promise.all([
      (supabase.from('profiles') as any).select('*', { count: 'exact', head: true }),
      (supabase.from('products') as any).select('*', { count: 'exact', head: true }).eq('status', 'active'),
      (supabase.from('orders') as any).select('*', { count: 'exact', head: true }),
      (supabase.from('seller_applications') as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      (supabase.from('withdrawal_requests') as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]).then(([users, products, orders, sellers, withdrawals]) => {
      setStats({
        users: users.count || 0,
        products: products.count || 0,
        orders: orders.count || 0,
        pendingSellers: sellers.count || 0,
        pendingWithdrawals: withdrawals.count || 0,
      })
    })
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm text-earth-500">Total Users</CardTitle><p className="text-2xl font-bold text-earth-900 mt-1">{stats.users}</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-sm text-earth-500">Active Products</CardTitle><p className="text-2xl font-bold text-earth-900 mt-1">{stats.products}</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-sm text-earth-500">Total Orders</CardTitle><p className="text-2xl font-bold text-earth-900 mt-1">{stats.orders}</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-sm text-earth-500">Pending Seller Applications</CardTitle><p className="text-2xl font-bold text-earth-900 mt-1">{stats.pendingSellers}</p></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-sm text-earth-500">Pending Withdrawals</CardTitle><p className="text-2xl font-bold text-earth-900 mt-1">{stats.pendingWithdrawals}</p></CardHeader></Card>
      </div>
    </div>
  )
}
