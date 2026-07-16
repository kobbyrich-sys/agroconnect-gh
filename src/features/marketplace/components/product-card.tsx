import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import type { Product } from '@/types/database'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/products/${product.slug}`}>
      <Card className="p-4 transition-shadow hover:shadow-md">
        <div className="aspect-square rounded-lg bg-earth-100 mb-4 flex items-center justify-center text-earth-400 text-sm">
          {product.unit}
        </div>
        <h3 className="text-sm font-medium text-earth-900 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-earth-600 mt-1">GH₵ {Number(product.price).toFixed(2)}</p>
      </Card>
    </Link>
  )
}
