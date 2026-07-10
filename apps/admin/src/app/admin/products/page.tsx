import { createServerClient } from '@agroconnect/shared';

export default async function ProductsPage() {
  const supabase = await createServerClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, retail_price, stock_quantity, status, is_published, created_at, categories(name), profiles!seller_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500">{products?.length ?? 0} products</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Product</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Seller</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Price</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Stock</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p: any) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{p.profiles?.full_name || 'Unknown'}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{p.categories?.name || '—'}</td>
                <td className="px-5 py-4 text-sm font-medium">₵{parseFloat(p.retail_price).toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{p.stock_quantity}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                    p.status === 'active' && p.is_published
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
