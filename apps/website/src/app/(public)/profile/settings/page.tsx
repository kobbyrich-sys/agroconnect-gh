'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    sms_notifications: true,
    marketing_emails: false,
    language: 'English',
    currency: 'GHS',
  });

  useEffect(() => {
    const saved = localStorage.getItem('agroconnect_prefs');
    if (saved) setPrefs(JSON.parse(saved));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('agroconnect_prefs', JSON.stringify(prefs));
        setMsg('Settings saved');
      } else {
        setMsg(data.error || 'Failed to save');
      }
    } catch {
      localStorage.setItem('agroconnect_prefs', JSON.stringify(prefs));
      setMsg('Settings saved locally');
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <Link href="/profile" className="mt-1 inline-block text-sm text-emerald-600 hover:underline">← Back to Account</Link>
        </div>

        {msg && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">{msg}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            <div className="mt-5 space-y-4">
              {[
                { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive order updates and promotions' },
                { key: 'sms_notifications', label: 'SMS Notifications', desc: 'Receive delivery updates via SMS' },
                { key: 'marketing_emails', label: 'Marketing Emails', desc: 'Tips, offers, and platform news' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <input type="checkbox" checked={(prefs as any)[item.key]}
                    onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                    className="accent-emerald-700 h-5 w-5" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Language & Region</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Language</label>
                <select value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {['English', 'Twi', 'Ewe', 'Ga', 'Hausa'].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select value={prefs.currency} onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="GHS">GHS (₵)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
            <p className="mt-2 text-sm text-gray-500">Deleting your account is permanent and cannot be undone.</p>
            <button type="button" onClick={async () => {
              if (confirm('Are you sure you want to delete your account?')) {
                await fetch('/api/users/profile', { method: 'DELETE' });
              }
            }} className="mt-4 rounded-lg border border-red-300 px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
              Delete Account
            </button>
          </div>

          <button type="submit" disabled={saving}
            className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
