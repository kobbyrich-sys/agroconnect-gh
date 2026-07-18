import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    ;(supabase.from('profiles') as any).select('*').order('created_at', { ascending: false }).then((res: any) => {
      if (res.data) setUsers(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetch() }, [])

  const toggleRole = async (user: any) => {
    const newRole = user.role === 'buyer' ? 'seller' : 'buyer'
    await (supabase.from('profiles') as any).update({ role: newRole }).eq('id', user.id)
    fetch()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Admin - Users" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Users</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-earth-100" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-earth-200">
          <table className="w-full text-sm">
            <thead className="bg-earth-50 text-left">
              <tr><th className="px-4 py-3 font-medium text-earth-600">Name</th><th className="px-4 py-3 font-medium text-earth-600">Role</th><th className="px-4 py-3 font-medium text-earth-600">Phone</th><th className="px-4 py-3 font-medium text-earth-600">Joined</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-earth-200">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-earth-50">
                  <td className="px-4 py-3 text-earth-900">{u.full_name}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'seller' ? 'bg-agro-100 text-agro-800' : 'bg-earth-100 text-earth-800'}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-earth-600">{u.phone || '-'}</td>
                  <td className="px-4 py-3 text-earth-600">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{u.role !== 'admin' && <Button size="sm" variant="outline" onClick={() => toggleRole(u)}>Toggle to {u.role === 'buyer' ? 'seller' : 'buyer'}</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
