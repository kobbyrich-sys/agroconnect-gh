'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const BUSINESS_TYPES = [
  { value: 'farmer', label: 'Farmer' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'food_processor', label: 'Food Processor' },
  { value: 'cooperative', label: 'Cooperative' },
  { value: 'agro_dealer', label: 'Agro Dealer' },
];

export default function SellerApplyPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      business_name: form.get('business_name'),
      business_type: form.get('business_type'),
      business_phone: form.get('business_phone'),
      business_address: form.get('business_address'),
      description: form.get('description'),
    };

    try {
      const res = await fetch('/api/sellers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Application failed');
        setLoading(false);
        return;
      }

      router.push('/seller');
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Become a Seller</h1>
        <p className="mt-1 text-sm text-gray-600">
          Register your business to start selling on AgroConnect GH
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
            Business Name
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            placeholder="Your farm or business name"
          />
        </div>

        <div>
          <label htmlFor="business_type" className="block text-sm font-medium text-gray-700">
            Business Type
          </label>
          <select
            id="business_type"
            name="business_type"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          >
            <option value="">Select type</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="business_phone" className="block text-sm font-medium text-gray-700">
            Business Phone
          </label>
          <input
            id="business_phone"
            name="business_phone"
            type="tel"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            placeholder="+233 XX XXX XXXX"
          />
        </div>

        <div>
          <label htmlFor="business_address" className="block text-sm font-medium text-gray-700">
            Business Address
          </label>
          <input
            id="business_address"
            name="business_address"
            type="text"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            placeholder="Region, City, Street"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            placeholder="Tell us about your business (optional)"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
