import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card, CardHeader, CardTitle, Input } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'

export function SellerSettingsPage() {
  const { profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [payoutMethod, setPayoutMethod] = useState<'mobile_money' | 'bank_transfer'>('mobile_money')
  const [payoutProvider, setPayoutProvider] = useState('')
  const [payoutAccount, setPayoutAccount] = useState('')
  const [notifyNewOrder, setNotifyNewOrder] = useState(true)
  const [notifyPayout, setNotifyPayout] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name || '')
    setPhone(profile.phone || '')
    ;(async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', profile.id).single()
      if (data) {
        const p = data as any
        setBio(p.bio || '')
        setPayoutMethod(p.payout_method || 'mobile_money')
        setPayoutProvider(p.payout_provider || '')
        setPayoutAccount(p.payout_account || '')
        setNotifyNewOrder(p.notify_new_order !== false)
        setNotifyPayout(p.notify_payout !== false)
      }
      setLoading(false)
    })()
  }, [profile])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    setSaved(false)
    const { error } = await (supabase.from('profiles') as any)
      .update({
        full_name: fullName,
        phone,
        bio,
        payout_method: payoutMethod,
        payout_provider: payoutProvider,
        payout_account: payoutAccount,
        notify_new_order: notifyNewOrder,
        notify_payout: notifyPayout,
      })
      .eq('id', profile.id)
    if (!error) {
      setSaved(true)
      refreshProfile()
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-earth-100 mb-6" />
        <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-earth-100" />)}</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Seller Settings" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Seller Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <div className="space-y-4 px-6 pb-6">
            <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} />
            <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <div>
              <label className="mb-1 block text-sm font-medium text-earth-700">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-earth-300 px-3 py-2 text-sm placeholder:text-earth-400 focus:border-agro-500 focus:outline-none focus:ring-1 focus:ring-agro-500"
                placeholder="Tell buyers about your farm or products..."
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Information</CardTitle>
          </CardHeader>
          <div className="space-y-4 px-6 pb-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-earth-700">Payout Method</label>
              <select
                value={payoutMethod}
                onChange={e => setPayoutMethod(e.target.value as any)}
                className="block w-full rounded-lg border border-earth-300 px-3 py-2 text-sm focus:border-agro-500 focus:outline-none focus:ring-1 focus:ring-agro-500"
              >
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <Input
              label={payoutMethod === 'mobile_money' ? 'Mobile Money Provider' : 'Bank Name'}
              value={payoutProvider}
              onChange={e => setPayoutProvider(e.target.value)}
              placeholder={payoutMethod === 'mobile_money' ? 'e.g. MTN, Vodafone, AirtelTigo' : 'e.g. GCB, Ecobank'}
            />
            <Input
              label={payoutMethod === 'mobile_money' ? 'Mobile Number' : 'Account Number'}
              value={payoutAccount}
              onChange={e => setPayoutAccount(e.target.value)}
              placeholder={payoutMethod === 'mobile_money' ? 'e.g. 055XXXXXXX' : 'e.g. 1234567890'}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <div className="space-y-4 px-6 pb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={notifyNewOrder}
                onChange={e => setNotifyNewOrder(e.target.checked)}
                className="h-4 w-4 rounded border-earth-300 text-agro-600 focus:ring-agro-500"
              />
              <span className="text-sm text-earth-700">Email me when I receive a new order</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={notifyPayout}
                onChange={e => setNotifyPayout(e.target.checked)}
                className="h-4 w-4 rounded border-earth-300 text-agro-600 focus:ring-agro-500"
              />
              <span className="text-sm text-earth-700">Email me when a payout is processed</span>
            </label>
          </div>
        </Card>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} loading={saving}>Save Settings</Button>
          {saved && <span className="text-sm text-agro-700 font-medium">Settings saved!</span>}
        </div>
      </div>
    </div>
  )
}
