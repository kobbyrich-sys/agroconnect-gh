export default function CouponsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 text-sm">+ New Coupon</button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Discount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Usage</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Expires</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">FARM{i}0</td>
                <td className="px-5 py-4 text-sm">{i * 10}% OFF</td>
                <td className="px-5 py-4 text-sm text-gray-500">{i * 10}/100</td>
                <td className="px-5 py-4 text-sm text-gray-500">Dec 2026</td>
                <td className="px-5 py-4">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Active</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="text-sm text-emerald-700 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
