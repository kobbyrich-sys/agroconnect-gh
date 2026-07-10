import { createServerClient } from '@agroconnect/shared';

async function getEscrowData() {
  const supabase = await createServerClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/admin/escrow`, { cache: 'no-store' });
    return res.json();
  } catch {
    return { success: false };
  }
}

export default async function AdminEscrowPage() {
  const data = await getEscrowData();

  if (!data.success) {
    return <div className="p-8 text-center text-gray-500">Failed to load escrow data</div>;
  }

  const { escrow_wallet, held_orders, timeout_config, wallet_config, recent_transactions } = data;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Escrow Management</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <div className="rounded-xl bg-white p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Total in Escrow</p>
          <p className="text-2xl font-bold text-gray-900">₵{parseFloat(escrow_wallet?.balance || '0').toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-white p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Held Orders</p>
          <p className="text-2xl font-bold text-blue-600">{held_orders?.length || 0}</p>
        </div>
        <div className="rounded-xl bg-white p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Active Disputes</p>
          <p className="text-2xl font-bold text-red-600">{data.summary?.active_disputes || 0}</p>
        </div>
        <div className="rounded-xl bg-white p-6 border border-gray-200">
          <p className="text-sm text-gray-500">Released</p>
          <p className="text-2xl font-bold text-emerald-600">{data.summary?.total_released || 0}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Held Orders</h2>
          <div className="space-y-3">
            {held_orders?.length === 0 && <p className="text-sm text-gray-500">No orders in escrow</p>}
            {held_orders?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-sm text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.profiles?.full_name} · {order.businesses?.business_name}</p>
                  <p className="text-xs text-gray-400">Paid: {new Date(order.paid_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₵{parseFloat(order.escrow_held_amount).toLocaleString()}</p>
                  {order.escrow_expires_at && (
                    <p className="text-xs text-amber-600">Expires: {new Date(order.escrow_expires_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeout Configuration</h2>
          <div className="space-y-4">
            {timeout_config?.map((cfg: any) => (
              <div key={cfg.stage} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{cfg.stage.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{cfg.timeout_hours}h · {cfg.default_action.replace('_', ' ')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${cfg.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                  {cfg.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Escrow Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent_transactions?.map((tx: any) => (
                <tr key={tx.id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">{tx.orders?.order_number || tx.order_id.slice(0, 8)}</td>
                  <td className="py-3">
                    <span className="capitalize">{tx.type}</span>
                  </td>
                  <td className="py-3 font-medium">₵{parseFloat(tx.amount).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>{tx.status}</span>
                  </td>
                  <td className="py-3 text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
