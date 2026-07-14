'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [profileRes, sellerRes] = await Promise.all([
      fetch('/api/users/profile'),
      fetch('/api/sellers/status'),
    ]);
    const pData = await profileRes.json();
    const sData = await sellerRes.json();
    if (pData.success) {
      setProfile(pData.profile);
      setName(pData.profile.full_name || '');
      setPhone(pData.profile.phone || '');
    }
    if (sData.success) setBusiness(sData.business);
    setLoading(false);
  }

  async function saveProfile() {
    setSaving(true);
    setSaveMsg('');
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, phone }),
    });
    const data = await res.json();
    if (data.success) {
      setProfile(data.profile);
      setEditing(false);
      setSaveMsg('Profile updated');
    } else {
      setSaveMsg(data.error);
    }
    setSaving(false);
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
        <h1 className="text-2xl font-bold text-gray-900">My Account</h1>

        {saveMsg && (
          <div className={`mt-4 rounded-lg p-4 text-sm ${saveMsg === 'Profile updated' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {saveMsg}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">{profile?.full_name}</h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <span className="mt-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">
                {profile?.role}
              </span>
            </div>

            <nav className="mt-4 rounded-xl border border-gray-200 bg-white p-2 space-y-1">
              {[
                { href: '/profile', label: 'Account' },
                { href: '/profile/addresses', label: 'Addresses' },
                { href: '/profile/settings', label: 'Settings' },
                { href: '/orders', label: 'My Orders' },
              ].map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium ${
                      active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {business && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900">Seller Status</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Business</span>
                    <span className="font-medium text-gray-900">{business.business_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="capitalize text-gray-900">{business.business_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${business.is_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {business.is_verified ? 'Verified' : business.status}
                    </span>
                  </div>
                </div>
                <Link href="/sell" className="mt-4 block text-center text-sm font-medium text-emerald-700 hover:underline">
                  Manage Store
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-sm font-medium text-emerald-700 hover:underline"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{profile?.full_name || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile?.email}
                    {profile?.is_email_verified ? (
                      <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">Verified</span>
                    ) : (
                      <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">Unverified</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  {editing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {profile?.phone || '—'}
                      {profile?.is_phone_verified && (
                        <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700">Verified</span>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm capitalize text-gray-900">{profile?.role}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              {editing && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/orders" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
                View All Orders →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
