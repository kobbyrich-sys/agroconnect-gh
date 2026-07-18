import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { getImageUrl } from '@/lib/storage'
import type { Product } from '@/types/database'

interface ProductCardProps {
  product: Product & { product_images?: { url: string }[] }
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null)

  useEffect(() => {
    if (product.product_images?.length) {
      setImgSrc(getImageUrl('product-images', product.product_images[0].url))
    }
  }, [product.product_images])

  return (
    <Link to={`/products/${product.slug}`}>
      <Card className="p-4 transition-shadow hover:shadow-md">
        <div className="aspect-square rounded-lg bg-earth-100 mb-4 flex items-center justify-center overflow-hidden">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} className="h-full w-full object-cover" onError={() => setImgSrc(null)} />
          ) : (
            <span className="text-earth-400 text-sm">{product.unit}</span>
          )}
        </div>
        <h3 className="text-sm font-medium text-earth-900 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-earth-600 mt-1">GH₵ {Number(product.price).toFixed(2)}</p>
      </Card>
    </Link>
  )
}
