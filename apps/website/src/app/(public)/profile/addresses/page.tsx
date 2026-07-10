'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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

const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Western North', 'Central',
  'Eastern', 'Volta', 'Oti', 'Northern', 'Savannah', 'North East',
  'Upper East', 'Upper West', 'Bono', 'Bono East', 'Ahafo',
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: '', street: '', city: '', region: 'Greater Accra',
    country: 'Ghana', gps_address: '', landmark: '', is_default: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAddresses(); }, []);

  async function fetchAddresses() {
    const res = await fetch('/api/users/addresses');
    const data = await res.json();
    if (data.success) setAddresses(data.addresses);
    setLoading(false);
  }

  function openCreate() {
    setForm({ label: '', street: '', city: '', region: 'Greater Accra', country: 'Ghana', gps_address: '', landmark: '', is_default: false });
    setEditingId(null);
    setShowForm(true);
    setError('');
  }

  function openEdit(addr: Address) {
    setForm({
      label: addr.label, street: addr.street, city: addr.city, region: addr.region,
      country: addr.country, gps_address: addr.gps_address || '',
      landmark: addr.landmark || '', is_default: addr.is_default,
    });
    setEditingId(addr.id);
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label || !form.street || !form.city || !form.region) {
      setError('Label, street, city, and region are required');
      return;
    }
    setSaving(true);
    setError('');

    const url = editingId
      ? `/api/users/addresses/${editingId}`
      : '/api/users/addresses';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (data.success) {
      setShowForm(false);
      setEditingId(null);
      await fetchAddresses();
    } else {
      setError(data.error);
    }
    setSaving(false);
  }

  async function deleteAddress(id: string) {
    await fetch(`/api/users/addresses/${id}`, { method: 'DELETE' });
    await fetchAddresses();
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
            <Link href="/profile" className="mt-1 inline-block text-sm text-emerald-600 hover:underline">← Back to Account</Link>
          </div>
          <button onClick={openCreate} className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
            + Add Address
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit' : 'New'} Address</h2>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Label *</label>
                <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Home, Office, Farm..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Region *</label>
                <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Street *</label>
                <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="Street name, building, area"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City / Town"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GPS Address</label>
                <input type="text" value={form.gps_address} onChange={(e) => setForm({ ...form, gps_address: e.target.value })}
                  placeholder="GA-123-4567"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Landmark</label>
                <input type="text" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  placeholder="Nearby landmark"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input type="checkbox" id="is_default" checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="accent-emerald-700" />
                <label htmlFor="is_default" className="text-sm text-gray-700">Set as default address</label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={saving}
                className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add'} Address
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 space-y-4">
          {addresses.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-500">No addresses saved yet</p>
              <button onClick={openCreate} className="mt-4 text-sm font-medium text-emerald-700 hover:underline">
                Add your first address
              </button>
            </div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {addr.label}
                      {addr.is_default && (
                        <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">Default</span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{addr.street}</p>
                    <p className="text-sm text-gray-500">{addr.city}, {addr.region}</p>
                    <p className="text-sm text-gray-500">{addr.country}</p>
                    {addr.gps_address && <p className="mt-1 text-xs text-gray-400">GPS: {addr.gps_address}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(addr)}
                      className="text-sm text-emerald-700 hover:underline">Edit</button>
                    <button onClick={() => deleteAddress(addr.id)}
                      className="text-sm text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
