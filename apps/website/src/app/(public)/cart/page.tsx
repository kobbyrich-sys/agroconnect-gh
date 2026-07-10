'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CartItem {
  id: string;
  quantity: number;
  wholesale: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    retail_price: string;
    wholesale_price: string | null;
    wholesale_min_quantity: number | null;
    stock_quantity: number;
    low_stock_threshold: number;
    discount_percentage: number;
    status: string;
    average_rating: string;
    sold_count: number;
    primary_image: string | null;
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      const res = await fetch('/api/cart');
      if (res.status === 401) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setSubtotal(data.subtotal);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    setUpdatingId(itemId);
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      ),
    );
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart();
      } else {
        setError(data.error);
        await fetchCart();
      }
    } catch {
      setError('Failed to update quantity');
      await fetchCart();
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    try {
      await fetch(`/api/cart/${itemId}`, { method: 'DELETE' });
      await fetchCart();
    } catch {
      setError('Failed to remove item');
      await fetchCart();
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h1>
        <p className="mt-3 text-gray-500">Add some products from the marketplace.</p>
        <Link href="/marketplace" className="mt-6 inline-block rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-800">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.wholesale && item.product.wholesale_price
                ? parseFloat(item.product.wholesale_price)
                : parseFloat(item.product.retail_price);
              const itemTotal = price * item.quantity;

              return (
                <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex gap-5">
                    <Link href={`/marketplace/${item.product.id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.product.primary_image ? (
                        <img src={item.product.primary_image} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-3xl text-gray-300">📦</div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link href={`/marketplace/${item.product.id}`} className="font-semibold text-gray-900 hover:text-emerald-700">
                          {item.product.name}
                        </Link>
                        {item.product.discount_percentage > 0 && (
                          <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
                            {item.product.discount_percentage}% OFF
                          </span>
                        )}
                        {item.product.stock_quantity <= item.product.low_stock_threshold && (
                          <p className="mt-0.5 text-xs text-amber-600">Low stock</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={updatingId === item.id || item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingId === item.id || item.quantity >= item.product.stock_quantity}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-emerald-700">₵{itemTotal.toLocaleString()}</p>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              <div className="mt-5 space-y-3 border-b border-gray-200 pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({items.length} items)</span>
                  <span className="font-medium text-gray-900">₵{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium text-gray-900">{subtotal >= 100 ? 'Free' : '₵15.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Commission (5%)</span>
                  <span className="font-medium text-gray-900">-₵{(subtotal * 0.05).toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-emerald-700">
                  ₵{(subtotal + (subtotal >= 100 ? 0 : 15) - subtotal * 0.05).toLocaleString()}
                </span>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block rounded-lg bg-emerald-700 px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Proceed to Checkout
              </Link>
              <Link href="/marketplace" className="mt-3 block text-center text-sm text-emerald-600 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
