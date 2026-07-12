import { Wrench, CheckCircle2, Clock } from 'lucide-react';

export default function Maintenance() {
  const tasks = [
    { id: 'MT-492', asset: 'MacBook Pro 16" (AST-1042)', task: 'Battery Replacement', date: 'Dec 15, 2025', status: 'Scheduled', priority: 'Medium' },
    { id: 'MT-493', asset: 'Server DB-01 (AST-099)', task: 'Firmware Upgrade', date: 'Jul 15, 2026', status: 'In Progress', priority: 'High' },
    { id: 'MT-494', asset: 'HVAC Unit 3 (AST-502)', task: 'Filter Change', date: 'Jun 20, 2026', status: 'Completed', priority: 'Low' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Maintenance</h1>
        <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors">
          Schedule Maintenance
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-secondary text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
              <th className="px-6 py-3 font-semibold">Task ID</th>
              <th className="px-6 py-3 font-semibold">Asset</th>
              <th className="px-6 py-3 font-semibold">Task Description</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-on-surface">{task.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-on-surface">{task.asset}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">{task.task}</td>
                <td className="px-6 py-4 text-sm text-on-surface-variant flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{task.date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                    task.status === 'Completed' ? 'bg-secondary-container/20 text-secondary' :
                    task.status === 'In Progress' ? 'bg-tertiary-container/20 text-tertiary' :
                    'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {task.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                    {task.status === 'In Progress' && <Wrench className="w-3 h-3" />}
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
