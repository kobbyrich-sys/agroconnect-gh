'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    sms_notifications: true,
    marketing_emails: false,
    language: 'English',
    currency: 'GHS',
  });

  const [cpw, setCpw] = useState({ current: '', new: '', confirm: '' });
  const [cpwSaving, setCpwSaving] = useState(false);
  const [cpwMsg, setCpwMsg] = useState('');
  const [cpwShow, setCpwShow] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/profile');
        const data = await res.json();
        if (data.success && data.profile?.metadata?.preferences) {
          setPrefs(data.profile.metadata.preferences);
          return;
        }
      } catch {}
      const saved = localStorage.getItem('agroconnect_prefs');
      if (saved) setPrefs(JSON.parse(saved));
    })();
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
      setMsg('Saved locally');
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setCpwMsg('');

    if (cpw.new.length < 8) {
      setCpwMsg('New password must be at least 8 characters');
      return;
    }
    if (cpw.new !== cpw.confirm) {
      setCpwMsg('Passwords do not match');
      return;
    }
    if (cpw.current === cpw.new) {
      setCpwMsg('New password must be different from current password');
      return;
    }

    setCpwSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: cpw.current, new_password: cpw.new }),
      });
      const data = await res.json();
      if (data.success) {
        setCpwMsg('Password changed. Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setCpwMsg(data.error || 'Failed to change password');
      }
    } catch {
      setCpwMsg('Network error. Please try again.');
    }
    setCpwSaving(false);
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

        <div className="mt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
              <div className="mt-5 space-y-4">
                {[
                  { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive order updates and promotions' },
                  { key: 'sms_notifications', label: 'SMS Notifications', desc: 'Receive order updates via SMS' },
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

            <button type="submit" disabled={saving}
              className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            <p className="mt-1 text-sm text-gray-500">You will be signed out after changing your password.</p>
            {cpwMsg && (
              <div className={`mt-3 rounded-lg p-3 text-sm ${cpwMsg.includes('Redirecting') || cpwMsg === 'Settings saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{cpwMsg}</div>
            )}
            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type={cpwShow ? 'text' : 'password'} value={cpw.current} required
                  onChange={(e) => setCpw({ ...cpw, current: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type={cpwShow ? 'text' : 'password'} value={cpw.new} required minLength={8}
                  onChange={(e) => setCpw({ ...cpw, new: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type={cpwShow ? 'text' : 'password'} value={cpw.confirm} required minLength={8}
                  onChange={(e) => setCpw({ ...cpw, confirm: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={cpwSaving}
                  className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                  {cpwSaving ? 'Changing...' : 'Change Password'}
                </button>
                <label className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={cpwShow} onChange={(e) => setCpwShow(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                  Show passwords
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
