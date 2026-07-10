export default function PaymentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₵847,230</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pending Payouts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₵124,500</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Commission Earned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₵42,361</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Transaction</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Order</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4 text-sm text-gray-900">TXN-{i}00000{i}</td>
                <td className="px-5 py-4 text-sm text-gray-600">AGC-{i}000{i}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{i % 2 === 0 ? 'Mobile Money' : 'Paystack'}</td>
                <td className="px-5 py-4 text-sm font-medium">₵{i * 100}.00</td>
                <td className="px-5 py-4">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">Completed</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">Today</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
