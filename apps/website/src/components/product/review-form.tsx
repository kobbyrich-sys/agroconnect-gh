'use client';

import { useState } from 'react';

export function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId || !comment) return;
    setSubmitting(true);
    setMessage('');

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, order_id: orderId, rating, title: title || undefined, comment }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage('Review submitted!');
      setOpen(false);
      setTitle('');
      setComment('');
      setOrderId('');
    } else {
      setMessage(data.error || 'Failed to submit review');
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-8">
      <button onClick={() => setOpen(!open)} className="text-sm font-medium text-emerald-600 hover:underline">
        {open ? 'Cancel' : 'Write a Review'}
      </button>

      {message && (
        <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Write Your Review</h3>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Order ID (required)</label>
            <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter the order ID for this purchase"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${star <= rating ? 'text-amber-500' : 'text-gray-300'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Title (optional)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your review"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Review</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4} required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <button type="submit" disabled={submitting}
            className="mt-4 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
}
