import Link from 'next/link';
import { getBaseUrl } from '@/lib/utils';

interface SearchParams {
  page?: string;
  category?: string;
  sort?: string;
  q?: string;
}

async function getProducts(searchParams: SearchParams) {
  const params = new URLSearchParams();
  if (searchParams.page) params.set('page', searchParams.page);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.sort) params.set('sort', searchParams.sort);
  if (searchParams.q) params.set('q', searchParams.q);

  const res = await fetch(
    `${getBaseUrl()}/api/products?${params.toString()}`,
    { cache: 'no-store' },
  );
  return res.json();
}

async function getCategories() {
  const res = await fetch(
    `${getBaseUrl()}/api/categories`,
    { cache: 'force-cache', next: { revalidate: 3600 } },
  );
  return res.json();
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [{ products, pagination }, { categories }] = await Promise.all([
    getProducts(sp),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <div className="flex items-center gap-3">
            <select
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              defaultValue={sp.sort || 'newest'}
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/marketplace"
                    className={`block rounded-lg px-3 py-2 text-sm ${!sp.category ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Products
                  </Link>
                </li>
                {categories?.map((cat: any) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/marketplace?category=${cat.slug}`}
                      className={`block rounded-lg px-3 py-2 text-sm ${sp.category === cat.slug ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                      <span className="ml-2 text-xs text-gray-400">({cat.product_count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1">
            {!products?.length ? (
              <div className="mt-20 text-center">
                <p className="text-lg text-gray-500">No products found</p>
                <Link href="/marketplace" className="mt-4 inline-block text-emerald-600 hover:underline">
                  Clear filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/marketplace/${product.id}`}
                      className="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
                    >
                      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                        {product.primary_image ? (
                          <img
                            src={product.primary_image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-4xl text-gray-300">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-emerald-600 font-medium">{product.category_name}</p>
                        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                        <p className="mt-2 text-lg font-bold text-emerald-700">
                          ₵{parseFloat(product.retail_price).toLocaleString()}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span>⭐ {parseFloat(product.average_rating || 0).toFixed(1)}</span>
                          <span>Sold: {product.sold_count || 0}</span>
                        </div>
                        {product.discount_percentage > 0 && (
                          <span className="mt-2 inline-block rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                            {product.discount_percentage}% OFF
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {pagination?.total_pages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/marketplace?page=${p}${sp.category ? `&category=${sp.category}` : ''}${sp.sort ? `&sort=${sp.sort}` : ''}`}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          (sp.page ? parseInt(sp.page) : 1) === p
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
