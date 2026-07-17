import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card, CardHeader, CardTitle } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'

export function WithdrawalPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [walletId, setWalletId] = useState('')
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'mobile_money' | 'bank_transfer'>('mobile_money')
  const [provider, setProvider] = useState('')
  const [accountDetails, setAccountDetails] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return
    ;(supabase.from('wallets') as any).select('*').eq('user_id', user.id).single().then((res: any) => {
      if (res.data) { setWalletId(res.data.id); setBalance(Number(res.data.balance)) }
    })
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    if (amt > balance) { setError('Insufficient balance'); return }
    if (!accountDetails) { setError('Enter account details'); return }
    setSubmitting(true)
    const { error: err } = await (supabase.from('withdrawal_requests') as any).insert({
      wallet_id: walletId,
      amount: amt,
      method,
      provider: provider || null,
      account_details: method === 'mobile_money' ? { phone: accountDetails } : { account: accountDetails },
    })
    if (err) { setError(err.message); setSubmitting(false) }
    else { setSuccess(true); setSubmitting(false) }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="text-center">
          <CardHeader><CardTitle>Withdrawal Request Submitted</CardTitle></CardHeader>
          <p className="px-6 pb-6 text-sm text-earth-600">Your withdrawal request is pending review. You&apos;ll be notified once processed.</p>
          <div className="pb-6"><Button onClick={() => navigate('/wallet')}>Back to Wallet</Button></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Withdraw Funds" />
      <h1 className="text-2xl font-bold text-earth-900 mb-2">Withdraw Funds</h1>
      <p className="text-sm text-earth-500 mb-6">Available balance: GH₵ {balance.toFixed(2)}</p>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">Amount (GH₵)</label>
            <input type="number" step="0.01" min="0" max={balance} required value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as any)}
              className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500">
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          {method === 'mobile_money' && (
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500">
                <option value="">Select provider</option>
                <option value="mtn">MTN Mobile Money</option>
                <option value="vodafone">Vodafone Cash</option>
                <option value="airteltigo">AirtelTigo Money</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">
              {method === 'mobile_money' ? 'Phone Number' : 'Account Details'}
            </label>
            <input type="text" required value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              placeholder={method === 'mobile_money' ? '054XXX XXXX' : 'Bank, branch, account number'}
              className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500" />
          </div>
          <Button type="submit" loading={submitting} className="w-full">Submit Withdrawal Request</Button>
        </form>
      </Card>
    </div>
  )
}
