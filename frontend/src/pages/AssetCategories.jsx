import { Folder, Laptop, Cpu, Mouse, Monitor } from 'lucide-react';

export default function AssetCategories() {
  const categories = [
    { name: 'Laptops', count: 342, icon: Laptop, color: 'text-primary' },
    { name: 'Monitors', count: 512, icon: Monitor, color: 'text-secondary' },
    { name: 'Accessories', count: 1205, icon: Mouse, color: 'text-tertiary' },
    { name: 'Servers', count: 48, icon: Cpu, color: 'text-error' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Asset Categories</h1>
        <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors">
          New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className={`p-3 rounded-lg bg-surface-container ${cat.color}`}>
              <cat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold text-on-surface">{cat.name}</div>
              <div className="text-sm text-on-surface-variant">{cat.count} total items</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
