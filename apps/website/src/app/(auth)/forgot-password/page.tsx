'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = emailRef.current?.value.trim();

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setResetLink(data.resetLink || '');
      setSent(true);
      setLoading(false);
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Reset link generated</h1>
          </div>
          {resetLink ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Since email delivery is currently unavailable, use the link below to reset your password:
              </p>
              <a
                href={resetLink}
                className="block rounded-lg bg-emerald-700 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
              >
                Click here to reset your password
              </a>
              <p className="text-xs text-gray-500 break-all bg-gray-50 rounded p-3 select-all">
                {resetLink}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center">
              If an account with that email exists, a reset link will be available.
            </p>
          )}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              ref={emailRef}
              id="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
