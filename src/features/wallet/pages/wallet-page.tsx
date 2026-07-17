import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card, CardHeader, CardTitle } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'
import type { LedgerEntry } from '@/types/database'

export function WalletPage() {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [pending, setPending] = useState(0)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    ;(supabase.from('wallets') as any).select('*').eq('user_id', user.id).single().then((res: any) => {
      if (res.data) {
        setBalance(Number(res.data.balance))
        setPending(Number(res.data.pending_balance))
        ;(supabase.from('ledger_entries') as any).select('*').eq('wallet_id', res.data.id).order('created_at', { ascending: false }).limit(20).then(({ data }: { data: any }) => {
          if (data) setEntries(data as LedgerEntry[])
          setLoading(false)
        })
      } else {
        ;(supabase.from('wallets') as any).insert({ user_id: user.id }).select().single().then(() => {
          setLoading(false)
        })
      }
    })
  }, [user])

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><div className="h-48 animate-pulse rounded-xl bg-earth-100" /></div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Wallet" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Wallet</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-earth-500">Available Balance</CardTitle>
            <p className="text-3xl font-bold text-agro-700">GH₵ {balance.toFixed(2)}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-earth-500">Pending Balance</CardTitle>
            <p className="text-3xl font-bold text-earth-600">GH₵ {pending.toFixed(2)}</p>
          </CardHeader>
        </Card>
      </div>
      <div className="flex gap-3 mb-8">
        <Link to="/wallet/withdraw"><Button variant="outline">Withdraw</Button></Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        {entries.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-earth-500">📭 No transactions yet. Your first sale will show up here!</p>
        ) : (
          <div className="divide-y divide-earth-100">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-earth-900 capitalize">{e.type.replace(/_/g, ' ')}</p>
                  {e.description && <p className="text-xs text-earth-500">{e.description}</p>}
                </div>
                <span className={`text-sm font-medium ${Number(e.amount) >= 0 ? 'text-agro-700' : 'text-red-600'}`}>
                  {Number(e.amount) >= 0 ? '+' : ''}{Number(e.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
