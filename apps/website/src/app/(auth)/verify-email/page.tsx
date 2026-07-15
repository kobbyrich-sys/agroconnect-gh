import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
        <p className="mt-2 text-sm text-gray-600">
          We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to
          verify your account.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Once verified, you can sign in to your account.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
