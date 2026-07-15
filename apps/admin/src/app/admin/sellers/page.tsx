import { createAdminClient } from '@agroconnect/shared';

export default async function SellersPage() {
  const supabase = await createAdminClient();
  const { data: sellers } = await supabase
    .from('businesses')
    .select('id, business_name, business_type, is_verified, status, created_at, profiles!owner_id(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
        <p className="text-sm text-gray-500">{sellers?.length ?? 0} sellers</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Business</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Owner</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Verification</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {sellers?.map((b: any) => (
              <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">{b.business_name}</p>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">
                  <p>{b.profiles?.full_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{b.profiles?.email}</p>
                </td>
                <td className="px-5 py-4 text-sm capitalize text-gray-600">{b.business_type}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${b.is_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {b.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
                    b.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {b.status || 'active'}
                  </span>
                </td>
              </tr>
            ))}
            {(!sellers || sellers.length === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No sellers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
