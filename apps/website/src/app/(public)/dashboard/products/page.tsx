import Link from 'next/link';
import { createServerClient } from '@agroconnect/shared';
import { redirect } from 'next/navigation';

export default async function SellerProductsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: products } = await supabase
    .from('products')
    .select('id, name, retail_price, stock_quantity, status, is_published, created_at, categories(name)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <Link href="/dashboard/products/new" className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
            + New Product
          </Link>
        </div>
        <Link href="/dashboard" className="mt-2 inline-block text-sm text-emerald-600 hover:underline">← Dashboard</Link>

        {(!products || products.length === 0) ? (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">You haven&apos;t listed any products yet</p>
            <Link href="/dashboard/products/new" className="mt-4 inline-block text-emerald-600 hover:underline">Add your first product</Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Price</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Stock</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.categories?.name || '—'}</td>
                    <td className="px-5 py-4 text-sm font-medium">₵{parseFloat(p.retail_price).toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{p.stock_quantity}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${p.is_published ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/dashboard/products/${p.id}/edit`} className="text-sm text-emerald-700 hover:underline">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
