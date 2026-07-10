import { createServerClient } from '@agroconnect/shared';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  failed: 'bg-red-50 text-red-700',
  refunded: 'bg-gray-50 text-gray-500',
};

export default async function OrdersPage() {
  const supabase = await createServerClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, total, status, payment_status, created_at, profiles!buyer_id(full_name), businesses(business_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">{orders?.length ?? 0} orders</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Order</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Buyer</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Seller</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Total</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Payment</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o: any) => (
              <tr key={o.order_number} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">{o.order_number}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{o.profiles?.full_name || 'Unknown'}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{o.businesses?.business_name || '—'}</td>
                <td className="px-5 py-4 text-sm font-medium">₵{parseFloat(o.total).toLocaleString()}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${STATUS_STYLES[o.status] || 'bg-gray-50 text-gray-600'}`}>{o.status}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${PAYMENT_STYLES[o.payment_status] || 'bg-gray-50 text-gray-600'}`}>{o.payment_status}</span>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
