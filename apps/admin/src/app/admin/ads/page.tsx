export default function AdsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Advertisements</h1>
        <button className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 text-sm">+ New Ad</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex gap-4">
              <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">Banner {i}</div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Advertisement {i}</h3>
                <p className="text-xs text-gray-500 mt-1">Home Banner - Top</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                  <span className="text-xs text-gray-500">1.2k clicks</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
