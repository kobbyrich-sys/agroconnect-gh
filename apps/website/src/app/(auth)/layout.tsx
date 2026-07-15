import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700">
              <span className="text-sm font-bold text-white">AG</span>
            </div>
            <span className="text-lg font-bold text-gray-900">AgroConnect GH</span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
