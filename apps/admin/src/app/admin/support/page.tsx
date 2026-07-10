export default function SupportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Tickets</h1>
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Order Issue - Order #AGC-{i}000{i}</h3>
                  <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">Urgent</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Customer reports item not matching description...</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>From: Customer {i}</span>
                  <span>2 hours ago</span>
                  <span>Order #{i}000{i}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">Assign</button>
                <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50">Resolve</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
