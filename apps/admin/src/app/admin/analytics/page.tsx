export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue (Last 30 Days)</h2>
          <div className="h-48 flex items-end gap-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex-1 bg-emerald-100 rounded-t" style={{ height: `${20 + Math.random() * 80}%` }}>
                <div className="bg-emerald-500 rounded-t h-full opacity-80" style={{ height: '100%' }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
          <div className="space-y-4">
            {[
              { label: 'Avg. Order Value', value: '₵245.00', change: '+8%' },
              { label: 'Conversion Rate', value: '3.2%', change: '+0.5%' },
              { label: 'Customer Retention', value: '68%', change: '+5%' },
              { label: 'Avg. Response Time', value: '2.4h', change: '-12%' },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{m.label}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{m.value}</span>
                  <span className="text-xs text-emerald-600 ml-2">{m.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
