'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RegisterSuccessPage() {
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState('');

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

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Account created!</h1>
        <p className="mt-2 text-gray-600">
          Welcome to AgroConnect GH. Please check your email to verify your account.
        </p>
        {sentMsg && (
          <p className="mt-3 text-sm text-emerald-700">{sentMsg}</p>
        )}
        <div className="mt-6 space-y-3">
          <Link
            href="/dashboard"
            className="block w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={resendVerification}
            disabled={sending}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Resend verification email'}
          </button>
          <Link
            href="/marketplace"
            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
