import { createServerClient } from '@agroconnect/shared';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700', confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-indigo-50 text-indigo-700', shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-red-50 text-red-700',
};

export default async function SellerOrdersPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, total, status, payment_status, created_at, buyer_notes, profiles!buyer_id(full_name, phone)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-emerald-600 hover:underline">← Dashboard</Link>

        {(!orders || orders.length === 0) ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">No orders received yet</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Order</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Buyer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Total</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Payment</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.order_number} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{o.order_number}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{o.profiles?.full_name || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm font-medium">₵{parseFloat(o.total).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                        o.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>{o.payment_status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${STATUS_STYLES[o.status] || 'bg-gray-50 text-gray-600'}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
