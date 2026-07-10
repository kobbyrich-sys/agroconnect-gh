import Link from 'next/link';
import { getBaseUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

async function getOrders(searchParams: { page?: string; status?: string }) {
  const params = new URLSearchParams();
  if (searchParams.page) params.set('page', searchParams.page);
  if (searchParams.status) params.set('status', searchParams.status);

  const res = await fetch(
    `${getBaseUrl()}/api/orders?${params.toString()}`,
    { cache: 'no-store' },
  );
  return res.json();
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const { orders, pagination } = await getOrders(sp);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

        <div className="mt-6 flex flex-wrap gap-2">
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <Link
              key={s}
              href={`/orders${s ? `?status=${s}` : ''}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                (sp.status || '') === s
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
        </div>

        {!orders?.length ? (
          <div className="mt-12 rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-lg text-gray-500">No orders found</p>
            <Link href="/marketplace" className="mt-4 inline-block text-emerald-600 hover:underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order: any) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{order.order_number}</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      ₵{parseFloat(order.total).toLocaleString()}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                      <span>{order.order_items?.length || 0} items</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      {order.businesses && (
                        <span className="text-gray-400">{order.businesses.business_name}</span>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600'}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pagination?.total_pages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/orders?page=${p}${sp.status ? `&status=${sp.status}` : ''}`}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  (sp.page ? parseInt(sp.page) : 1) === p
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
