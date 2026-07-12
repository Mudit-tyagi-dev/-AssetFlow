import { Building2, Users } from 'lucide-react';

export default function DepartmentManagement() {
  const depts = [
    { name: 'Engineering', head: 'Sarah Jenkins', headcount: 145, budget: '$2.5M' },
    { name: 'Design', head: 'Michael Chen', headcount: 32, budget: '$800K' },
    { name: 'Sales', head: 'Robert Ford', headcount: 89, budget: '$1.2M' },
    { name: 'Human Resources', head: 'Emily Davis', headcount: 14, budget: '$300K' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Department Management</h1>
        <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors">
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {depts.map((dept, idx) => (
          <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-container text-on-primary-container rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface">{dept.name}</h3>
                  <div className="text-sm text-on-surface-variant">Head: {dept.head}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-outline-variant">
              <div>
                <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Headcount</div>
                <div className="font-medium text-on-surface flex items-center gap-1.5"><Users className="w-4 h-4 text-outline" /> {dept.headcount}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Asset Budget</div>
                <div className="font-medium text-on-surface">{dept.budget}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
