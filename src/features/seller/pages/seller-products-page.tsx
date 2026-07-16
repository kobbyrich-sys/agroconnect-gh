import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button, Card } from '@/components/ui'
import type { Product } from '@/types/database'

export function SellerProductsPage() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = () => {
    if (!profile?.id) return
    setLoading(true)
    supabase.from('products').select('*').eq('seller_id', profile.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setProducts(data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchProducts() }, [profile?.id])

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active'
    await (supabase.from('products') as any).update({ status: newStatus }).eq('id', product.id)
    fetchProducts()
  }

  const removeProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    fetchProducts()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-earth-900">My Products</h1>
        <Link to="/seller/products/new"><Button>Add Product</Button></Link>
      </div>
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-earth-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-earth-500 mb-4">You haven&apos;t listed any products yet.</p>
          <Link to="/seller/products/new"><Button>Add Your First Product</Button></Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-earth-900 truncate">{product.name}</h3>
                <p className="text-sm text-earth-500">GH₵ {Number(product.price).toFixed(2)} / {product.unit} &middot; Stock: {product.stock}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.status === 'active' ? 'bg-agro-100 text-agro-800' : 'bg-earth-100 text-earth-600'}`}>
                  {product.status}
                </span>
                <Button variant="outline" size="sm" onClick={() => toggleStatus(product)}>
                  {product.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Link to={`/seller/products/edit/${product.id}`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => removeProduct(product.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
