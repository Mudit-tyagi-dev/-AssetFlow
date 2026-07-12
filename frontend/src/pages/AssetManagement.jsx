import { Plus, Search, Filter, MoreVertical } from 'lucide-react';

export default function AssetManagement() {
  const assets = [
    { id: 'AST-1042', name: 'MacBook Pro 16"', category: 'Hardware', status: 'Active', assignedTo: 'Alex Carter' },
    { id: 'AST-1043', name: 'Dell UltraSharp 32"', category: 'Hardware', status: 'Active', assignedTo: 'Sarah Jenkins' },
    { id: 'AST-1044', name: 'Office Chair (Herman Miller)', category: 'Furniture', status: 'In Repair', assignedTo: 'Unassigned' },
    { id: 'AST-1045', name: 'Adobe Creative Cloud', category: 'Software', status: 'Active', assignedTo: 'Design Team' },
    { id: 'AST-1046', name: 'Cisco Meraki Router', category: 'Network', status: 'Retired', assignedTo: 'IT Dept' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Asset Management</h1>
        <button className="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors">
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="w-full pl-9 pr-4 py-1.5 bg-surface rounded border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-container text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-outline-variant rounded text-sm font-medium text-on-surface bg-surface hover:bg-surface-container transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                <th className="px-6 py-3 font-semibold">Asset ID</th>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Assigned To</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-on-surface">{asset.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">{asset.name}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{asset.category}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      asset.status === 'Active' ? 'bg-secondary-container bg-opacity-20 text-secondary' :
                      asset.status === 'In Repair' ? 'bg-tertiary-container bg-opacity-20 text-tertiary' :
                      'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{asset.assignedTo}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-outline hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-outline-variant flex items-center justify-between text-sm text-on-surface-variant bg-surface-container-low">
          <div>Showing 1 to 5 of 5 entries</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-outline-variant rounded bg-surface disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-outline-variant rounded bg-surface disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
