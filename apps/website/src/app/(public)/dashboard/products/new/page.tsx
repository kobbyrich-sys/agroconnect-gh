'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category { id: string; name: string; slug: string }
interface Subcategory { id: string; name: string; slug: string }

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', description: '', short_description: '', category_id: '', subcategory_id: '',
    retail_price: '', wholesale_price: '', wholesale_min_quantity: '',
    stock_quantity: '1', low_stock_threshold: '5', discount_percentage: '0',
    unit: 'kg', is_published: false, region: '',
  });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (d.success) setCategories(d.categories);
    });
  }, []);

  useEffect(() => {
    if (!form.category_id) { setSubcategories([]); return; }
    fetch(`/api/categories/${form.category_id}`).then(r => r.json()).then(d => {
      if (d.success?.subcategories) setSubcategories(d.success.subcategories);
    });
  }, [form.category_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        retail_price: parseFloat(form.retail_price),
        wholesale_price: form.wholesale_price ? parseFloat(form.wholesale_price) : undefined,
        wholesale_min_quantity: form.wholesale_min_quantity ? parseInt(form.wholesale_min_quantity) : undefined,
        stock_quantity: parseInt(form.stock_quantity),
        low_stock_threshold: parseInt(form.low_stock_threshold),
        discount_percentage: parseInt(form.discount_percentage) || 0,
        subcategory_id: form.subcategory_id || undefined,
      }),
    });

    const data = await res.json();
    if (data.success) {
      router.push('/dashboard/products');
    } else {
      setError(data.error);
    }
    setSubmitting(false);
  };

  const input = (field: string, label: string, opts?: any) => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={opts?.type || 'text'}
        value={(form as any)[field]}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        required={opts?.required !== false}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        {...opts?.attrs}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
        <Link href="/dashboard/products" className="mt-2 inline-block text-sm text-emerald-600 hover:underline">← My Products</Link>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Basic Info</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {input('name', 'Product Name', { attrs: { placeholder: 'e.g., Fresh Organic Tomatoes' } })}
              {input('unit', 'Unit', { attrs: { placeholder: 'kg, crate, bag, piece' } })}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  required rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">{input('short_description', 'Short Description')}</div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Category & Pricing</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value, subcategory_id: '' })}
                  required className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                <select value={form.subcategory_id} onChange={e => setForm({ ...form, subcategory_id: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">None</option>
                  {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {input('retail_price', 'Retail Price (₵)', { type: 'number', attrs: { step: '0.01', min: '0' } })}
              {input('wholesale_price', 'Wholesale Price (₵)', { type: 'number', attrs: { step: '0.01', min: '0' } })}
              {input('wholesale_min_quantity', 'Min. Wholesale Qty', { type: 'number', attrs: { min: '1' } })}
              {input('discount_percentage', 'Discount %', { type: 'number', attrs: { min: '0', max: '100' } })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-900">Inventory</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {input('stock_quantity', 'Stock Quantity', { type: 'number', attrs: { min: '0' } })}
              {input('low_stock_threshold', 'Low Stock Alert', { type: 'number', attrs: { min: '1' } })}
              {input('region', 'Region/Location')}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6">
            <div>
              <p className="font-medium text-gray-900">Publish immediately</p>
              <p className="text-sm text-gray-500">Make this product visible in the marketplace</p>
            </div>
            <input type="checkbox" checked={form.is_published}
              onChange={e => setForm({ ...form, is_published: e.target.checked })}
              className="accent-emerald-700 h-5 w-5" />
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-emerald-700 px-8 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
            <Link href="/dashboard/products"
              className="rounded-lg border border-gray-300 px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
