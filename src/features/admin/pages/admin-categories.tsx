import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, Button, Input } from '@/components/ui'
import { SeoHelmet } from '@/components/seo/helmet'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const fetch = () => {
    setLoading(true)
    supabase.from('categories').select('*').order('name').then(({ data }: any) => {
      if (data) setCategories(data)
      setLoading(false)
    })
  }

  useEffect(() => { fetch() }, [])

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    await supabase.from('categories').insert({ name: name.trim(), slug, description: description.trim() || null } as any)
    setName('')
    setDescription('')
    setSaving(false)
    fetch()
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await supabase.from('categories').delete().eq('id', id)
    fetch()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Admin - Categories" />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Categories</h1>
      <Card className="p-6 mb-6">
        <h2 className="text-sm font-bold text-earth-900 mb-4">Add Category</h2>
        <form onSubmit={addCategory} className="space-y-3">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fresh Vegetables" required />
          <div>
            <label className="mb-1 block text-sm font-medium text-earth-700">Description (optional)</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description" className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-700" />
          </div>
          <Button type="submit" loading={saving}>Add Category</Button>
        </form>
      </Card>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-earth-100" />)}</div>
      ) : (
        <div className="space-y-2">
          {categories.map((c: any) => (
            <Card key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-earth-900">{c.name}</p>
                {c.description && <p className="text-xs text-earth-500">{c.description}</p>}
              </div>
              <Button size="sm" variant="outline" onClick={() => deleteCategory(c.id)} className="text-red-500 border-red-200 hover:bg-red-50">Delete</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
