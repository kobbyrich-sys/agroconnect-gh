'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  region: string;
  country: string;
  gps_address: string | null;
  landmark: string | null;
  is_default: boolean;
}

const PAYMENT_METHODS = [
  { value: 'paystack', label: 'Paystack (Card, Mobile Money)', icon: '💳' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵' },
  { value: 'mobile_money', label: 'Mobile Money', icon: '📱', providers: ['mtn', 'vodafone', 'airteltigo'] },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [mobileProvider, setMobileProvider] = useState('mtn');

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      const res = await fetch('/api/users/addresses');
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses);
        const defaultAddr = data.addresses.find((a: Address) => a.is_default);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
        else if (data.addresses.length > 0) setSelectedAddress(data.addresses[0].id);
      }
    } catch {
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAddress) { setError('Please select a shipping address'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping_address_id: selectedAddress, notes: notes || undefined }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) { setError(orderData.error); setSubmitting(false); return; }

      const payData: any = { order_id: orderData.order.id, method: paymentMethod };
      if (paymentMethod === 'mobile_money') payData.provider = mobileProvider;

      const payRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payData),
      });
      const payResult = await payRes.json();
      if (!payResult.success) { setError(payResult.error); setSubmitting(false); return; }

      if (paymentMethod === 'paystack' && payResult.authorization_url) {
        window.location.href = payResult.authorization_url;
      } else {
        router.push('/orders');
      }
    } catch {
      setError('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
            {addresses.length === 0 ? (
              <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
                No saved addresses. <Link href="/profile" className="font-medium underline">Add an address</Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                    selectedAddress === addr.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="address" value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={(e) => setSelectedAddress(e.target.value)} className="mt-1 accent-emerald-700" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {addr.label}
                        {addr.is_default && <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700">Default</span>}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">{addr.street}, {addr.city}, {addr.region}</p>
                      {addr.gps_address && <p className="text-xs text-gray-400">GPS: {addr.gps_address}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
            <div className="mt-4 space-y-3">
              {PAYMENT_METHODS.map((pm) => (
                <label key={pm.value} className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                  paymentMethod === pm.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="payment" value={pm.value}
                    checked={paymentMethod === pm.value}
                    onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 accent-emerald-700" />
                  <div>
                    <p className="font-medium text-gray-900">{pm.icon} {pm.label}</p>
                    {pm.value === 'mobile_money' && paymentMethod === 'mobile_money' && (
                      <select value={mobileProvider} onChange={(e) => setMobileProvider(e.target.value)}
                        className="mt-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="vodafone">Vodafone Cash</option>
                        <option value="airteltigo">AirtelTigo Money</option>
                      </select>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Order Notes</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for the seller?" rows={3}
              className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link href="/cart" className="text-sm text-emerald-600 hover:underline">Back to Cart</Link>
            <button type="submit" disabled={submitting || addresses.length === 0}
              className="rounded-lg bg-emerald-700 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-50">
              {submitting ? 'Processing...' : `Place Order`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
