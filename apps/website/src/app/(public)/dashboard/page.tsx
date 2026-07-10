import Link from 'next/link';
import { createServerClient } from '@agroconnect/shared';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: business } = await supabase
    .from('businesses')
    .select('id, business_name, is_verified, status')
    .eq('owner_id', user.id)
    .maybeSingle();

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', user.id);

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', user.id)
    .in('status', ['pending', 'confirmed', 'processing']);

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('order_number, total, status, created_at')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            {business && (
              <p className="mt-1 text-sm text-gray-500">{business.business_name} — {business.is_verified ? '✅ Verified' : '⏳ Pending verification'}</p>
            )}
          </div>
          <Link href="/dashboard/products/new" className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
            + New Product
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Products', value: productCount ?? 0, href: '/dashboard/products' },
            { label: 'Pending Orders', value: orderCount ?? 0, href: '/dashboard/orders' },
            { label: 'Total Sales', value: '—', href: '#' },
            { label: 'Wallet', value: '—', href: '/wallet' },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">Quick Links</h2>
            <div className="mt-4 space-y-2">
              {[
                { label: 'Manage Products', href: '/dashboard/products' },
                { label: 'View Orders', href: '/dashboard/orders' },
                { label: 'Add New Product', href: '/dashboard/products/new' },
                { label: 'Withdraw Funds', href: '/wallet' },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  <span className="text-emerald-600">→</span> {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="mt-4 space-y-3">
                {recentOrders.map((o: any) => (
                  <div key={o.order_number} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <p className="text-sm font-medium text-gray-900">{o.order_number}</p>
                    <span className="text-sm text-gray-500">₵{parseFloat(o.total).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
