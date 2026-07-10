import Link from 'next/link';
import { getBaseUrl } from '@/lib/utils';

async function getCategory(slug: string) {
  const res = await fetch(
    `${getBaseUrl()}/api/categories/${slug}`,
    { cache: 'no-store' },
  );
  return res.json();
}

async function getProducts(categorySlug: string) {
  const res = await fetch(
    `${getBaseUrl()}/api/products?category=${categorySlug}&limit=50`,
    { cache: 'no-store' },
  );
  return res.json();
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ category }, { products }] = await Promise.all([
    getCategory(slug),
    getProducts(slug),
  ]);

  if (!category) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
          <Link href="/categories" className="mt-4 inline-block text-emerald-600 hover:underline">
            Browse Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-emerald-600">Categories</Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-gray-500">{category.description}</p>
          )}
        </div>

        {category.subcategories?.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href={`/categories/${slug}`}
              className="rounded-full bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white"
            >
              All
            </Link>
            {category.subcategories.map((sub: any) => (
              <Link
                key={sub.slug}
                href={`/categories/${slug}?sub=${sub.id}`}
                className="rounded-full bg-white border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {!products?.length ? (
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-500">No products in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
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
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="mt-1 text-lg font-bold text-emerald-700">₵{parseFloat(product.retail_price).toLocaleString()}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>⭐ {parseFloat(product.average_rating || 0).toFixed(1)}</span>
                    <span>{product.sold_count || 0} sold</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
