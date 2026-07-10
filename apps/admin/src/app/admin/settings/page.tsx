export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>
      <div className="grid gap-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission Percentage</label>
              <input type="number" defaultValue={5} className="w-full px-4 py-2 rounded-lg border border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Withdrawal (GHS)</label>
              <input type="number" defaultValue={50} className="w-full px-4 py-2 rounded-lg border border-gray-300" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input type="text" defaultValue="AgroConnect GH" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input type="email" defaultValue="support@agroconnectgh.com" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <input type="text" defaultValue="+233 XX XXX XXXX" className="w-full px-4 py-2 rounded-lg border border-gray-300" />
            </div>
            <button className="px-6 py-2.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
