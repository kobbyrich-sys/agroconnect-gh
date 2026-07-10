'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data: any;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => {
      if (d.success) setNotifications(d.notifications);
      setLoading(false);
    });
  }, []);

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {notifications.some(n => !n.is_read) && (
            <button onClick={markAllRead} className="text-sm font-medium text-emerald-600 hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="mt-12 rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-lg text-gray-500">No notifications yet</p>
            <Link href="/marketplace" className="mt-4 inline-block text-emerald-600 hover:underline">Browse Products</Link>
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className={`rounded-xl border p-4 transition-all ${
                n.is_read ? 'border-gray-200 bg-white' : 'border-emerald-200 bg-emerald-50'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.is_read ? 'text-gray-900' : 'font-semibold text-gray-900'}`}>{n.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
