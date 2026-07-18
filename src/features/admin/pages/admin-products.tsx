import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'

export function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    ;(supabase.from('products') as any).select('*, profiles(full_name)').order('created_at', { ascending: false }).then((res: any) => {
      if (res.data) setProducts(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetch() }, [])

  const toggleStatus = async (p: any) => {
    const next = p.status === 'active' ? 'inactive' : 'active'
    await (supabase.from('products') as any).update({ status: next }).eq('id', p.id)
    fetch()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Admin - Products" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Products</h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-earth-100" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-earth-200">
          <table className="w-full text-sm">
            <thead className="bg-earth-50 text-left">
              <tr><th className="px-4 py-3 font-medium text-earth-600">Name</th><th className="px-4 py-3 font-medium text-earth-600">Seller</th><th className="px-4 py-3 font-medium text-earth-600">Price</th><th className="px-4 py-3 font-medium text-earth-600">Status</th><th className="px-4 py-3 font-medium text-earth-600">Stock</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-earth-200">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-earth-50">
                  <td className="px-4 py-3 text-earth-900 max-w-[200px] truncate">{p.name}</td>
                  <td className="px-4 py-3 text-earth-600">{p.profiles?.full_name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-earth-900">GH₵ {Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${p.status === 'active' ? 'bg-agro-100 text-agro-800' : p.status === 'draft' ? 'bg-earth-100 text-earth-600' : 'bg-red-100 text-red-800'}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-earth-600">{Number(p.stock)}</td>
                  <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => toggleStatus(p)}>{p.status === 'active' ? 'Deactivate' : 'Activate'}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
