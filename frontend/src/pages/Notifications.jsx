import { Bell, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function Notifications() {
  const notifs = [
    { id: 1, type: 'alert', title: 'Server Capacity Critical', desc: 'Database server DB-01 is at 95% capacity.', time: '10 mins ago', icon: AlertTriangle, color: 'text-error bg-error/10' },
    { id: 2, type: 'success', title: 'Maintenance Complete', desc: 'Routine maintenance for AST-891 finished successfully.', time: '1 hour ago', icon: CheckCircle2, color: 'text-secondary bg-secondary/10' },
    { id: 3, type: 'info', title: 'New Asset Assigned', desc: 'You have been assigned a new MacBook Pro.', time: '2 hours ago', icon: Info, color: 'text-primary bg-primary/10' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Notifications</h1>
        <button className="text-sm font-medium text-primary hover:underline">Mark all as read</button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm divide-y divide-outline-variant">
        {notifs.map(n => (
          <div key={n.id} className="p-5 flex gap-4 hover:bg-surface-container-lowest/50 transition-colors cursor-pointer">
            <div className={`p-2 rounded-full h-fit ${n.color}`}>
              <n.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-on-surface">{n.title}</div>
              <div className="text-sm text-on-surface-variant mt-1">{n.desc}</div>
              <div className="text-xs text-outline mt-2 font-medium">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
