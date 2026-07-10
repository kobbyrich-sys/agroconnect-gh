import Link from 'next/link';
import { getBaseUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const ESCROW_STYLES: Record<string, string> = {
  pending: 'bg-gray-50 text-gray-600 border-gray-200',
  held: 'bg-blue-50 text-blue-700 border-blue-200',
  released: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refunded: 'bg-amber-50 text-amber-700 border-amber-200',
  disputed: 'bg-red-50 text-red-700 border-red-200',
};

async function getOrder(id: string) {
  const res = await fetch(
    `${getBaseUrl()}/api/orders/${id}`,
    { cache: 'no-store' },
  );
  return res.json();
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { order } = await getOrder(id);

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
          <Link href="/orders" className="mt-4 inline-block text-emerald-600 hover:underline">
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          <Link href="/orders" className="hover:text-emerald-600">My Orders</Link>
          <span>/</span>
          <span className="text-gray-900">{order.order_number}</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600'}`}>
              {order.status}
            </span>
            <span className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize ${ESCROW_STYLES[order.escrow_status] || 'bg-gray-50 text-gray-600'}`}>
              Escrow: {order.escrow_status}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-gray-900">Items</h2>
              <div className="mt-4 space-y-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl text-gray-300">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/marketplace/${item.product_id}`} className="font-medium text-gray-900 hover:text-emerald-700">
                        {item.product_name}
                      </Link>
                      <div className="mt-1 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Qty: {item.quantity} × ₵{parseFloat(item.unit_price).toLocaleString()}</span>
                        <span className="font-semibold text-gray-900">₵{parseFloat(item.total).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.buyer_notes && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="font-semibold text-gray-900">Order Notes</h2>
                <p className="mt-2 text-sm text-gray-600">{order.buyer_notes}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-gray-900">Order Summary</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₵{parseFloat(order.subtotal).toLocaleString()}</span>
                </div>
                {parseFloat(order.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-emerald-600">-₵{parseFloat(order.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Commission</span>
                  <span className="font-medium text-gray-900">-₵{parseFloat(order.commission || 0).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-emerald-700">₵{parseFloat(order.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {order.businesses && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="font-semibold text-gray-900">Seller</h2>
                <div className="mt-3">
                  <p className="font-medium text-gray-900">{order.businesses.business_name}</p>
                  <p className="text-sm text-gray-500">{order.businesses.business_type}</p>
                  {order.businesses.business_phone && (
                    <p className="text-sm text-gray-500">{order.businesses.business_phone}</p>
                  )}
                </div>
              </div>
            )}

            {order.payments?.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="font-semibold text-gray-900">Payment</h2>
                <div className="mt-3 space-y-2 text-sm">
                  {order.payments.map((payment: any) => (
                    <div key={payment.reference} className="flex justify-between">
                      <span className="text-gray-500 capitalize">{payment.method}</span>
                      <span className={`font-medium ${
                        payment.status === 'completed' ? 'text-emerald-600' :
                        payment.status === 'failed' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-gray-900">Escrow</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium capitalize ${
                    order.escrow_status === 'released' ? 'text-emerald-600' :
                    order.escrow_status === 'refunded' ? 'text-amber-600' :
                    order.escrow_status === 'disputed' ? 'text-red-600' : 'text-blue-600'
                  }`}>{order.escrow_status}</span>
                </div>
                {order.escrow_held_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Held Amount</span>
                    <span className="font-medium">₵{parseFloat(order.escrow_held_amount).toLocaleString()}</span>
                  </div>
                )}
                {order.escrow_released_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Released</span>
                    <span className="font-medium">{new Date(order.escrow_released_at).toLocaleDateString()}</span>
                  </div>
                )}
                {order.escrow_expires_at && order.escrow_status === 'held' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Auto-release</span>
                    <span className="font-medium">{new Date(order.escrow_expires_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
