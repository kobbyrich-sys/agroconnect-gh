import Link from 'next/link';
import { WishlistButton } from '@/components/product/wishlist-button';
import { ReviewForm } from '@/components/product/review-form';

export const dynamic = 'force-dynamic';

async function getProduct(id: string) {
  const res = await fetch(
    `${getBaseUrl()}/api/products/${id}`,
    { cache: 'no-store' },
  );
  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { product } = await getProduct(id);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
          <Link href="/marketplace" className="mt-4 inline-block text-emerald-600 hover:underline">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-emerald-600">Marketplace</Link>
          <span>/</span>
          <Link href={`/marketplace?category=${product.category_slug}`} className="hover:text-emerald-600">
            {product.category_name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
              {product.primary_image ? (
                <img
                  src={product.primary_image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl text-gray-300">📦</span>
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="mt-4 flex gap-3">
                {product.images.slice(0, 4).map((img: any) => (
                  <div key={img.id} className="h-20 w-20 overflow-hidden rounded-lg bg-gray-100">
                    <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-emerald-600">{product.category_name}</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-lg text-amber-500">⭐</span>
                <span className="font-semibold text-gray-900">{parseFloat(product.average_rating || 0).toFixed(1)}</span>
                <span className="text-gray-500">({product.review_count || 0} reviews)</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{product.sold_count || 0} sold</span>
              {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Only {product.stock_quantity} left
                </span>
              )}
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-emerald-700">
                ₵{parseFloat(product.retail_price).toLocaleString()}
              </span>
              {product.wholesale_price && (
                <span className="text-sm text-gray-500">
                  Wholesale: ₵{parseFloat(product.wholesale_price).toLocaleString()} (min. {product.wholesale_min_quantity})
                </span>
              )}
            </div>

            {product.discount_percentage > 0 && (
              <div className="mt-3 inline-block rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600">
                {product.discount_percentage}% OFF — Save ₵
                {(parseFloat(product.retail_price) * product.discount_percentage / 100).toFixed(2)}
              </div>
            )}

            <div className="mt-8">
              <h3 className="font-semibold text-gray-900">Description</h3>
              <p className="mt-2 leading-relaxed text-gray-600">{product.description}</p>
            </div>

            {product.business && (
              <div className="mt-8 rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900">Sold by</h3>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    {(product.business as any).business_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{(product.business as any).business_name}</p>
                    <p className="text-sm text-gray-500">
                      {(product.business as any).business_type} &middot; {(product.business as any).is_verified ? '✅ Verified' : 'Pending verification'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <button className="flex-1 rounded-lg bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800">
                Add to Cart
              </button>
              <WishlistButton productId={product.id} />
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
          <ReviewForm productId={product.id} />
          <div className="mt-6 space-y-6">
            {product.reviews.slice(0, 5).map((review: any) => (
              <div key={review.id} className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                    {review.profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.profiles?.full_name || 'Anonymous'}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">{'⭐'.repeat(review.rating)}</span>
                      <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {review.title && <p className="mt-2 font-medium text-gray-900">{review.title}</p>}
                <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {product.related_products?.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900">Related Products</h2>
            <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
              {product.related_products.map((rp: any) => (
                <Link
                  key={rp.id}
                  href={`/marketplace/${rp.id}`}
                  className="group rounded-xl border border-gray-200 p-3 transition-all hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {rp.primary_image ? (
                      <img src={rp.primary_image} alt={rp.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><span className="text-3xl text-gray-300">📦</span></div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900 line-clamp-1">{rp.name}</p>
                  <p className="mt-1 text-sm font-bold text-emerald-700">₵{parseFloat(rp.retail_price).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
