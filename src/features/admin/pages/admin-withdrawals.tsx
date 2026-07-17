import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Card } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'
import { OrderCardSkeleton } from '@/components/ui/skeleton'

export function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    ;(supabase.from('withdrawal_requests') as any).select('*, wallets!inner(user_id, profiles!inner(full_name))').order('created_at', { ascending: false }).then((res: any) => {
      if (res.data) setRequests(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetch() }, [])

  const process = async (req: any, status: string) => {
    const updates: any = { status }
    if (status === 'processed') updates.processed_at = new Date().toISOString()
    await (supabase.from('withdrawal_requests') as any).update(updates).eq('id', req.id)
    fetch()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Admin - Withdrawals" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Withdrawal Requests</h1>
      {loading ? <div className="space-y-4">{[1,2,3].map(i => <OrderCardSkeleton key={i} />)}</div>
        : requests.length === 0 ? <Card className="p-8 text-center"><p className="text-earth-500">💰 No withdrawal requests.</p></Card>
        : <div className="space-y-4">{requests.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-earth-900">GH₵ {Number(r.amount).toFixed(2)}</p>
                  <p className="text-xs text-earth-600">{r.method.replace('_', ' ')} &middot; {r.provider || '-'}</p>
                  <p className="text-xs text-earth-500">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'approved' ? 'bg-blue-100 text-blue-800' : r.status === 'processed' ? 'bg-agro-100 text-agro-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span>
              </div>
              {r.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => process(r, 'approved')}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => process(r, 'rejected')}>Reject</Button>
                </div>
              )}
              {r.status === 'approved' && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => process(r, 'processed')}>Mark Processed</Button>
                  <Button size="sm" variant="outline" onClick={() => process(r, 'rejected')}>Reject</Button>
                </div>
              )}
            </Card>
        ))}</div>}
    </div>
  )
}
