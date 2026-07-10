import Link from 'next/link';
import { getBaseUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function getCategories() {
  const res = await fetch(`${getBaseUrl()}/api/categories`, {
    cache: 'force-cache',
    next: { revalidate: 3600 },
  });
  return res.json();
}

export default async function CategoriesPage() {
  const { categories } = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
          <p className="mt-3 text-gray-500">
            Browse products by category
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories?.map((cat: any) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl">{cat.icon || '📁'}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  {cat.product_count} items
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-emerald-700">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{cat.description}</p>
              )}
              {cat.subcategories?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cat.subcategories.slice(0, 4).map((sub: any) => (
                    <span key={sub.slug} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                      {sub.name}
                    </span>
                  ))}
                  {cat.subcategories.length > 4 && (
                    <span className="text-xs text-gray-400">+{cat.subcategories.length - 4} more</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
