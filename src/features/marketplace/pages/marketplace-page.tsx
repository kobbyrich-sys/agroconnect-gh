import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '../components/product-card'
import { SeoHelmet } from '@/components/seo/helmet'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import type { Product, Category } from '@/types/database'

export function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('created_at')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    let query = supabase.from('products').select('*').eq('status', 'active')

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    query = query.order(sort, { ascending: sort === 'price' })

    query.then(({ data, error }) => {
      if (!error && data) setProducts(data)
      setLoading(false)
    })
  }, [search, categoryId, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHelmet title="Marketplace" description="Browse fresh produce, livestock, and farm equipment from Ghanaian farmers." />
      <h1 className="text-2xl font-bold text-earth-900 mb-6">Marketplace</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-earth-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
        >
          <option value="created_at">Newest</option>
          <option value="price">Price: Low to High</option>
          <option value="name">Name</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">🌾</p>
          <p className="text-lg font-medium text-earth-700 mb-1">No products found</p>
          <p className="text-sm text-earth-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
