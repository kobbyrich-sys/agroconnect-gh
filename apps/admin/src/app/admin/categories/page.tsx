export default function CategoriesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 text-sm">+ New Category</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['Vegetables', 'Fruits', 'Grains & Cereals', 'Dairy & Eggs', 'Livestock', 'Farming Equipment', 'Fertilizers', 'Packaging'].map((cat) => (
          <div key={cat} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">📁</div>
                <div>
                  <h3 className="font-medium text-gray-900">{cat}</h3>
                  <p className="text-xs text-gray-500">{Math.floor(Math.random() * 500)} products</p>
                </div>
              </div>
              <button className="text-sm text-emerald-700 hover:underline">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
