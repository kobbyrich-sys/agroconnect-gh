import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card } from '@/components/ui'
import type { Product, Category } from '@/types/database'

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({
    name: '',
    category_id: '',
    description: '',
    price: '',
    unit: 'unit',
    min_order: '1',
    stock: '0',
    status: 'draft',
  })

  const isEdit = !!id

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
    if (id) {
      setLoading(true)
      (supabase.from('products') as any).select('*').eq('id', id).single().then(({ data }: { data: any }) => {
        if (data) {
          setForm({
            name: data.name,
            category_id: data.category_id,
            description: data.description,
            price: String(data.price),
            unit: data.unit,
            min_order: String(data.min_order),
            stock: String(data.stock),
            status: data.status,
          })
        }
        setLoading(false)
      })
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return
    setSaving(true)

    const payload = {
      seller_id: profile.id,
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now(),
      category_id: form.category_id,
      description: form.description,
      price: parseFloat(form.price),
      currency: 'GHS',
      unit: form.unit,
      min_order: parseFloat(form.min_order),
      stock: parseFloat(form.stock),
      status: form.status,
    }

    if (isEdit) {
      const { error } = await (supabase.from('products') as any).update(payload).eq('id', id)
      if (!error) navigate('/seller/products')
    } else {
      const { error } = await (supabase.from('products') as any).insert(payload)
      if (!error) navigate('/seller/products')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-xl bg-earth-100" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-earth-900 mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">Name</label>
            <input
              type="text" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">Category</label>
            <select
              required value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">Description</label>
            <textarea
              rows={4} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Price (GH₵)</label>
              <input
                type="number" step="0.01" min="0" required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Unit</label>
              <input
                type="text" required
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="kg, bag, crate..."
                className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Min Order</label>
              <input
                type="number" step="0.01" min="0" required
                value={form.min_order}
                onChange={(e) => setForm({ ...form, min_order: e.target.value })}
                className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth-700 mb-1">Stock</label>
              <input
                type="number" step="0.01" min="0" required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-earth-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Product['status'] })}
              className="w-full rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/seller/products')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
