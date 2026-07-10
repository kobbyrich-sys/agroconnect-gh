'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface WishlistItem {
  wishlist_id: string;
  id: string;
  name: string;
  slug: string;
  retail_price: string;
  discount_percentage: number;
  average_rating: string;
  primary_image: string | null;
  added_at: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wishlist').then(r => r.json()).then(d => {
      if (d.success) setItems(d.items);
      setLoading(false);
    });
  }, []);

  async function remove(productId: string) {
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    setItems(prev => prev.filter(i => i.id !== productId));
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="mt-12 rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-lg text-gray-500">Your wishlist is empty</p>
            <Link href="/marketplace" className="mt-4 inline-block text-emerald-600 hover:underline">Browse Products</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.wishlist_id} className="group relative rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md">
                <button onClick={() => remove(item.id)} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-red-500 hover:bg-red-50">
                  ♥
                </button>
                <Link href={`/marketplace/${item.id}`}>
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {item.primary_image ? (
                      <img src={item.primary_image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><span className="text-4xl text-gray-300">📦</span></div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="mt-1 text-lg font-bold text-emerald-700">₵{parseFloat(item.retail_price).toLocaleString()}</p>
                    {parseFloat(item.average_rating || '0') > 0 && (
                      <p className="mt-1 text-xs text-gray-500">⭐ {parseFloat(item.average_rating).toFixed(1)}</p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
