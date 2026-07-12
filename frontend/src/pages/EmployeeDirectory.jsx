import { Mail, Phone, Search } from 'lucide-react';

export default function EmployeeDirectory() {
  const employees = [
    { id: 1, name: 'Alex Carter', role: 'IT Admin', dept: 'Engineering', email: 'alex@company.com', phone: '+1 234 567 890' },
    { id: 2, name: 'Sarah Jenkins', role: 'Product Manager', dept: 'Product', email: 'sarah@company.com', phone: '+1 234 567 891' },
    { id: 3, name: 'Michael Chen', role: 'Senior Designer', dept: 'Design', email: 'michael@company.com', phone: '+1 234 567 892' },
    { id: 4, name: 'Emily Davis', role: 'HR Specialist', dept: 'HR', email: 'emily@company.com', phone: '+1 234 567 893' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Employee Directory</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-container text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="w-20 h-20 mx-auto bg-primary-container text-on-primary-container rounded-full flex items-center justify-center text-2xl font-bold font-heading mb-4">
              {emp.name.charAt(0)}
            </div>
            <div className="font-semibold text-on-surface text-lg">{emp.name}</div>
            <div className="text-sm text-primary font-medium mt-1">{emp.role}</div>
            <div className="text-xs text-on-surface-variant mt-0.5">{emp.dept}</div>
            
            <div className="mt-6 flex justify-center gap-3">
              <button className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <Mail className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
