import { ArrowUpRight, ArrowDownRight, Users, Box, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const kpis = [
    { title: 'Total Assets', value: '12,450', change: '+2.5%', trend: 'up', icon: Box },
    { title: 'Active Employees', value: '3,240', change: '+1.2%', trend: 'up', icon: Users },
    { title: 'Maintenance Alerts', value: '24', change: '-5.0%', trend: 'down', icon: AlertTriangle, warning: true },
    { title: 'Compliance Rate', value: '98.5%', change: '+0.5%', trend: 'up', icon: CheckCircle2, success: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-on-surface">Dashboard Overview</h1>
        <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors">
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary-container">
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                kpi.warning ? 'text-error' : kpi.trend === 'up' ? 'text-secondary-container bg-opacity-10' : 'text-error'
              }`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1 text-secondary" /> : <ArrowDownRight className="w-4 h-4 mr-1 text-error" />}
                <span className={kpi.trend === 'up' ? 'text-secondary' : 'text-error'}>{kpi.change}</span>
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-heading text-on-surface mb-1">{kpi.value}</div>
              <div className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">{kpi.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-heading font-semibold mb-4">Asset Allocation Trend</h2>
          <div className="h-64 flex items-center justify-center text-on-surface-variant border border-dashed border-outline-variant rounded-lg bg-surface">
            [Chart Area Placeholder]
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-heading font-semibold mb-4">Recent Alerts</h2>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                <AlertTriangle className="w-5 h-5 text-tertiary-container mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm text-on-surface">Server #{400 + i} maintenance due</div>
                  <div className="text-xs text-on-surface-variant mt-1">2 hours ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
