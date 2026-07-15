import { createAdminClient } from '@agroconnect/shared';

export default async function DashboardPage() {
  const supabase = await createAdminClient();

  const [
    { count: userCount },
    { count: sellerCount },
    { count: productCount },
    { count: orderCount },
    { count: pendingVerifications },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed', 'processing']),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_verified', false),
    supabase.from('orders')
      .select('order_number, total, status, created_at, profiles!buyer_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total Users', value: userCount ?? 0, color: 'text-emerald-600' },
          { label: 'Active Sellers', value: sellerCount ?? 0, color: 'text-blue-600' },
          { label: 'Active Products', value: productCount ?? 0, color: 'text-amber-600' },
          { label: 'Pending Orders', value: orderCount ?? 0, color: 'text-rose-600' },
          { label: 'Pending Verification', value: pendingVerifications ?? 0, color: 'text-orange-600' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="mb-1 text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Orders</h2>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div key={order.order_number} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.profiles?.full_name || 'Unknown'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    ₵{parseFloat(order.total).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No recent orders</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Pending Verifications</h2>
          <p className="text-sm text-gray-400">{pendingVerifications ?? 0} businesses awaiting verification</p>
        </div>
      </div>
    </div>
  );
}
