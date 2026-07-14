'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const resendVerification = async () => {
    setSending(true);
    setSentMsg('');
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
      const data = await res.json();
      setSentMsg(data.message || 'Verification email sent.');
    } catch {
      setSentMsg('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
      </div>
    );
  }

  if (!user) return null;

  const quickLinks = [
    { href: '/marketplace', label: 'Browse Marketplace', desc: 'Explore products from farmers and vendors' },
    { href: '/sell', label: 'Sell Products', desc: 'List your agricultural products for sale' },
    { href: '/orders', label: 'My Orders', desc: 'Track your purchases and sales' },
    { href: '/profile', label: 'Profile Settings', desc: 'Manage your account and preferences' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {!user.is_email_verified && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-amber-800">Please verify your email address</p>
              <p className="text-xs text-amber-700">Check your inbox for a verification link.</p>
            </div>
            <button
              onClick={resendVerification}
              disabled={sending}
              className="shrink-0 rounded-md bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
          {sentMsg && <p className="mt-2 text-xs text-amber-700">{sentMsg}</p>}
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{user.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here is an overview of your AgroConnect account.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-700">
              {link.label}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email Verified</dt>
            <dd className={`font-medium ${user.is_email_verified ? 'text-green-600' : 'text-amber-600'}`}>
              {user.is_email_verified ? 'Yes' : 'No'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Role</dt>
            <dd className="font-medium text-gray-900 capitalize">{user.role}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Status</dt>
            <dd className="font-medium text-green-600 capitalize">{user.status || 'active'}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={signOut}
          className="rounded-lg px-6 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
