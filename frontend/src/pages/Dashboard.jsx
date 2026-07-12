import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Box, ShieldAlert, Wrench, CheckCircle2, RotateCcw } from 'lucide-react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard/summary');
        setDashboardData(response.data.kpis);
      } catch (error) {
        console.error("Dashboard fetch error", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  const kpis = dashboardData ? [
    { title: 'Available Assets', value: dashboardData.available_assets, trend: 'up', icon: Box },
    { title: 'Allocated Assets', value: dashboardData.allocated_assets, trend: 'up', icon: CheckCircle2, success: true },
    { title: 'Active Maintenance', value: dashboardData.maintenance_active, trend: dashboardData.maintenance_active > 0 ? 'down' : 'up', icon: Wrench, warning: dashboardData.maintenance_active > 0 },
    { title: 'Overdue Returns', value: dashboardData.overdue_returns, trend: dashboardData.overdue_returns > 0 ? 'down' : 'up', icon: ShieldAlert, warning: dashboardData.overdue_returns > 0 },
  ] : [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-surface-container-high rounded-lg"></div>
          <div className="h-10 w-32 bg-surface-container-high rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm h-32 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-10 h-10 bg-surface-container-high rounded-lg"></div>
                <div className="w-16 h-6 bg-surface-container-high rounded"></div>
              </div>
              <div>
                <div className="w-24 h-8 bg-surface-container-high rounded mb-2"></div>
                <div className="w-32 h-4 bg-surface-container-high rounded"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 h-80 shadow-sm flex flex-col">
             <div className="w-48 h-6 bg-surface-container-high rounded mb-4"></div>
             <div className="flex-1 bg-surface-container rounded-lg"></div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 h-80 shadow-sm flex flex-col">
            <div className="w-32 h-6 bg-surface-container-high rounded mb-4"></div>
            <div className="space-y-4 flex-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex-shrink-0"></div>
                  <div className="space-y-2 flex-1 pt-1">
                    <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                    <div className="h-3 bg-surface-container-high rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
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
                <ShieldAlert className="w-5 h-5 text-tertiary-container mt-0.5 flex-shrink-0" />
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
