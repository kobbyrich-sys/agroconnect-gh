import Link from 'next/link';
import { getBaseUrl } from '@/lib/utils';

interface SearchParams {
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
  page?: string;
}

async function searchProducts(params: SearchParams) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.category) qs.set('category', params.category);
  if (params.min_price) qs.set('min_price', params.min_price);
  if (params.max_price) qs.set('max_price', params.max_price);
  if (params.sort) qs.set('sort', params.sort);
  if (params.page) qs.set('page', params.page);
  qs.set('limit', '24');

  const res = await fetch(
    `${getBaseUrl()}/api/search?${qs.toString()}`,
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const [{ products, pagination }, { categories }] = await Promise.all([
    searchProducts(sp),
    getCategories(),
  ]);

  const hasFilters = sp.q || sp.category || sp.min_price || sp.max_price;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {sp.q ? `Results for "${sp.q}"` : 'Search Products'}
            </h1>
            {pagination?.total && (
              <p className="mt-1 text-sm text-gray-500">{pagination.total} products found</p>
            )}
          </div>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            defaultValue={sp.sort || 'relevance'}
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <div className="mt-8 flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Category</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={sp.q ? `/search?q=${sp.q}` : '/search'}
                    className={`block rounded-lg px-3 py-2 text-sm ${!sp.category ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories?.map((cat: any) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/search?q=${sp.q || ''}&category=${cat.slug}${sp.sort ? `&sort=${sp.sort}` : ''}`}
                      className={`block rounded-lg px-3 py-2 text-sm ${sp.category === cat.slug ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider text-gray-500">Price Range</h3>
              <form className="space-y-3">
                <input
                  type="number"
                  name="min_price"
                  placeholder="Min ₵"
                  defaultValue={sp.min_price}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  name="max_price"
                  placeholder="Max ₵"
                  defaultValue={sp.max_price}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Apply
                </button>
              </form>
            </div>
          </aside>

          <div className="flex-1">
            {!hasFilters && !sp.q ? (
              <div className="mt-16 text-center">
                <p className="text-lg text-gray-500">Enter a search term to find products</p>
              </div>
            ) : !products?.length ? (
              <div className="mt-16 text-center">
                <p className="text-lg text-gray-500">No products match your search</p>
                <Link href="/search" className="mt-4 inline-block text-emerald-600 hover:underline">
                  Clear all filters
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
                          <img src={product.primary_image} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center"><span className="text-4xl text-gray-300">📦</span></div>
                        )}
                      </div>
                      <div className="mt-4">
                        <p className="text-xs font-medium text-emerald-600">{product.category_name}</p>
                        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                        <p className="mt-2 text-lg font-bold text-emerald-700">
                          ₵{parseFloat(product.retail_price).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                {pagination?.total_pages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/search?q=${sp.q || ''}&page=${p}${sp.category ? `&category=${sp.category}` : ''}${sp.sort ? `&sort=${sp.sort}` : ''}`}
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
