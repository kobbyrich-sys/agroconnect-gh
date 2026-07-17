import { useState, useEffect, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import { Button, Card } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'
import { OrderCardSkeleton } from '@/components/ui/skeleton'
import { AuthContext } from '@/features/auth/contexts/auth-context'

export function AdminSellersPage() {
  const { profile } = useContext(AuthContext)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    ;(supabase.from('seller_applications') as any).select('*').order('created_at', { ascending: false }).then((res: any) => {
      if (res.data) setApplications(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetch() }, [])

  const approve = async (app: any) => {
    const { error: appErr } = await (supabase.from('seller_applications') as any)
      .update({ status: 'approved', reviewed_by: profile?.id })
      .eq('id', app.id)
    if (appErr) return alert('Failed to approve application: ' + appErr.message)
    const { error: profileErr } = await (supabase.from('profiles') as any)
      .update({ role: 'seller' })
      .eq('id', app.user_id)
    if (profileErr) return alert('Application approved but failed to update user role: ' + profileErr.message)
    fetch()
  }

  const reject = async (app: any) => {
    const { error } = await (supabase.from('seller_applications') as any)
      .update({ status: 'rejected', reviewed_by: profile?.id })
      .eq('id', app.id)
    if (error) return alert('Failed to reject application: ' + error.message)
    fetch()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Admin - Sellers" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Seller Applications</h1>
      {loading ? <div className="space-y-4">{[1,2,3].map(i => <OrderCardSkeleton key={i} />)}</div>
        : applications.length === 0 ? <Card className="p-8 text-center"><p className="text-earth-500">📋 No seller applications yet.</p></Card>
        : <div className="space-y-4">{applications.map((app: any) => (
            <Card key={app.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-earth-900">{app.business_name}</h3>
                  <p className="text-sm text-earth-600">{app.business_type} &middot; {app.business_email}</p>
                  <p className="text-xs text-earth-500 mt-1">{app.business_address} &middot; {app.business_phone}</p>
                  {app.tax_id && <p className="text-xs text-earth-500">Tax ID: {app.tax_id}</p>}
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'approved' ? 'bg-agro-100 text-agro-800' : 'bg-red-100 text-red-800'}`}>{app.status}</span>
              </div>
              {app.status === 'pending' && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => approve(app)}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => reject(app)}>Reject</Button>
                </div>
              )}
            </Card>
        ))}</div>}
    </div>
  )
}
