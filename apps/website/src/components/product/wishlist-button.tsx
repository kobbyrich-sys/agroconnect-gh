'use client';

import { useEffect, useState } from 'react';

export function WishlistButton({ productId }: { productId: string }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/wishlist').then(r => r.json()).then(d => {
      if (d.success) setInWishlist(d.items?.some((i: any) => i.id === productId));
    });
  }, [productId]);

  async function toggle() {
    setLoading(true);
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    const d = await res.json();
    if (d.success) setInWishlist(d.is_wished);
    setLoading(false);
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors ${
        inWishlist
          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}>
      {inWishlist ? '♥ Saved' : '♡ Save to Wishlist'}
    </button>
  );
}
