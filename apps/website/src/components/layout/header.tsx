'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NotificationBell } from '@/components/layout/notification-bell';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700">
            <span className="text-sm font-bold text-white">AG</span>
          </div>
          <span className="text-lg font-bold text-gray-900">AgroConnect GH</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <NotificationBell />
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
          >
            Get Started
          </Link>
        </div>

        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2" />
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700"
              onClick={() => setOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-700 px-4 py-2 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
