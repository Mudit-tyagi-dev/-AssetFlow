import { PieChart, List, Server, Monitor } from 'lucide-react';

export default function AssetAllocation() {
  const allocations = [
    { department: 'Engineering', count: 450, percentage: 45, color: 'bg-primary' },
    { department: 'Design', count: 120, percentage: 12, color: 'bg-secondary' },
    { department: 'Marketing', count: 80, percentage: 8, color: 'bg-tertiary' },
    { department: 'Sales', count: 250, percentage: 25, color: 'bg-error' },
    { department: 'HR & Admin', count: 100, percentage: 10, color: 'bg-outline' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Asset Allocation</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Allocation by Department
          </h2>
          <div className="space-y-4">
            {allocations.map(item => (
              <div key={item.department}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-on-surface">{item.department}</span>
                  <span className="text-on-surface-variant">{item.percentage}% ({item.count} items)</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2">
                  <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-heading font-semibold mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-secondary" />
            Category Breakdown
          </h2>
          <div className="flex items-center justify-center h-48 border border-dashed border-outline-variant rounded-lg bg-surface text-on-surface-variant">
            [Interactive Chart Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
}
