import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Box, 
  ShieldAlert, 
  Wrench, 
  CheckCircle2, 
  Calendar, 
  ClipboardList, 
  Bell, 
  Layers, 
  History, 
  Activity,
  UserCheck
} from 'lucide-react';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

// Helper to decode JWT payload safely
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return {};
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getActivityDetails = (log) => {
  const meta = log.metadata || log.meta_data || {};
  switch (log.action) {
    case 'create_asset':
      return {
        message: `Asset "${meta.name || 'Unknown'}" registered`,
        color: 'text-primary bg-primary/10 border-primary/20',
        icon: Box
      };
    case 'update_asset':
      return {
        message: `Asset "${meta.name || 'Unknown'}" updated`,
        color: 'text-primary bg-primary/10 border-primary/20',
        icon: Box
      };
    case 'delete_asset':
      return {
        message: `Asset tag "${meta.tag || ''}" deleted`,
        color: 'text-error bg-error/10 border-error/20',
        icon: Box
      };
    case 'create_booking':
      return {
        message: `New resource booking requested`,
        color: 'text-tertiary bg-tertiary/10 border-tertiary/20',
        icon: Calendar
      };
    case 'cancel_booking':
      return {
        message: `Resource booking cancelled`,
        color: 'text-outline bg-surface-container-high border-outline/20',
        icon: Calendar
      };
    case 'create_maintenance':
    case 'raise_maintenance':
      return {
        message: `Maintenance raised: "${meta.description || 'Issue reported'}"`,
        color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
        icon: Wrench
      };
    case 'approve_maintenance':
      return {
        message: `Maintenance request approved`,
        color: 'text-success bg-success/10 border-success/20',
        icon: Wrench
      };
    case 'resolve_maintenance':
      return {
        message: `Maintenance resolved and marked healthy`,
        color: 'text-success bg-success/10 border-success/20',
        icon: CheckCircle2
      };
    case 'checkout_allocation':
      return {
        message: `Asset allocated to holder`,
        color: 'text-secondary bg-secondary/10 border-secondary/20',
        icon: UserCheck
      };
    case 'checkin_allocation':
      return {
        message: `Asset returned and checked in`,
        color: 'text-outline bg-surface-container-high border-outline/20',
        icon: RotateCcwFallback
      };
    case 'create_category':
      return {
        message: `Category "${meta.name || ''}" created`,
        color: 'text-primary bg-primary/10 border-primary/20',
        icon: Layers
      };
    case 'create_department':
      return {
        message: `Department "${meta.name || ''}" created`,
        color: 'text-primary bg-primary/10 border-primary/20',
        icon: Layers
      };
    default:
      return {
        message: `${log.action.replace(/_/g, ' ')}`,
        color: 'text-on-surface-variant bg-surface-container border-outline-variant/30',
        icon: Activity
      };
  }
};

// Fallback icon for check-in since RotateCcw is not in basic imports or we want direct mapping
const RotateCcwFallback = CheckCircle2;

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [role, setRole] = useState('employee');
  const [basePath, setBasePath] = useState('/user');
  
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Decode role and set base path
    const token = localStorage.getItem('access_token');
    let currentRole = 'employee';
    let currentPath = '/user';
    
    if (token) {
      const decoded = decodeToken(token);
      currentRole = decoded.role || 'employee';
      if (currentRole === 'admin') currentPath = '/admin';
      else if (currentRole === 'manager') currentPath = '/manager';
      else if (currentRole === 'head') currentPath = '/head';
    }
    setRole(currentRole);
    setBasePath(currentPath);

    // 2. Fetch all data concurrently
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, assetsRes, auditsRes, notifRes] = await Promise.all([
          apiClient.get('/dashboard/summary'),
          apiClient.get('/assets', { params: { limit: 1 } }),
          apiClient.get('/audits', { params: { status: 'in_progress', limit: 1 } }).catch(() => null),
          apiClient.get('/notifications', { params: { is_read: false, limit: 1 } }).catch(() => null)
        ]);

        const summary = summaryRes.data.kpis;
        const totalAssets = assetsRes.data.total;
        
        let pendingAudits = null;
        let unreadNotifications = 0;

        if (auditsRes) {
          pendingAudits = auditsRes.data.total;
        }
        if (notifRes) {
          unreadNotifications = notifRes.data.total;
        }

        setDashboardData({
          ...summary,
          total_assets: totalAssets,
          pending_audits: pendingAudits,
          unread_notifications: unreadNotifications
        });

        // 3. Fetch Activity logs
        try {
          const logsRes = await apiClient.get('/logs', { params: { limit: 8 } });
          setActivities(logsRes.data.items || []);
        } catch (err) {
          // If logs fails (e.g. non-admin 403), load fallback recent entities
          await fetchActivitiesFallback();
        }

      } catch (error) {
        console.error("Dashboard fetch error", error);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchActivitiesFallback = async () => {
      try {
        const [assetsRes, bookingsRes, maintRes] = await Promise.all([
          apiClient.get('/assets', { params: { limit: 5 } }).catch(() => ({ data: { items: [] } })),
          apiClient.get('/bookings', { params: { limit: 5 } }).catch(() => ({ data: { items: [] } })),
          apiClient.get('/maintenance', { params: { limit: 5 } }).catch(() => ({ data: { items: [] } }))
        ]);

        const assets = assetsRes.data.items || [];
        const bookings = bookingsRes.data.items || [];
        const maintenance = maintRes.data.items || [];

        const assetActivities = assets.map(a => ({
          id: a.id,
          action: 'create_asset',
          entity_type: 'asset',
          created_at: a.created_at || a.acquisition_date,
          metadata: { name: a.name, tag: a.asset_tag }
        }));

        const bookingActivities = bookings.map(b => ({
          id: b.id,
          action: 'create_booking',
          entity_type: 'booking',
          created_at: b.created_at || b.start_time,
          metadata: { id: b.id }
        }));

        const maintenanceActivities = maintenance.map(m => ({
          id: m.id,
          action: 'create_maintenance',
          entity_type: 'maintenance_request',
          created_at: m.created_at,
          metadata: { description: m.issue_description }
        }));

        const merged = [...assetActivities, ...bookingActivities, ...maintenanceActivities]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 8);

        setActivities(merged);
      } catch (err) {
        console.error("Failed to fetch fallbacks", err);
        setActivities([]);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-surface-container-high rounded-lg"></div>
          <div className="h-10 w-36 bg-surface-container-high rounded-lg"></div>
        </div>

        {/* 6 KPI Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm h-[108px] flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="w-20 h-3 bg-surface-container-high rounded"></div>
                <div className="w-7 h-7 bg-surface-container-high rounded-lg"></div>
              </div>
              <div className="w-12 h-7 bg-surface-container-high rounded mt-4"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Placeholder */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
          <div className="w-32 h-4 bg-surface-container-high rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-surface-container-high rounded-xl"></div>
            ))}
          </div>
        </div>

        {/* 2-column layout Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 h-80 shadow-sm flex flex-col">
              <div className="w-48 h-6 bg-surface-container-high rounded mb-6"></div>
              <div className="flex-1 bg-surface-container rounded-xl"></div>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 h-64 shadow-sm flex flex-col">
              <div className="w-48 h-6 bg-surface-container-high rounded mb-6"></div>
              <div className="flex-1 bg-surface-container rounded-xl"></div>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 h-[400px] shadow-sm flex flex-col">
            <div className="w-32 h-6 bg-surface-container-high rounded mb-6"></div>
            <div className="space-y-4 flex-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-surface-container rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculated rate values for Analytics card
  const availableCount = dashboardData?.available_assets || 0;
  const allocatedCount = dashboardData?.allocated_assets || 0;
  const totalCount = dashboardData?.total_assets || (availableCount + allocatedCount);
  const allocationRate = totalCount > 0 ? ((allocatedCount / totalCount) * 100).toFixed(0) : 0;
  const maintenanceCount = dashboardData?.maintenance_active || 0;
  const maintenanceRatio = totalCount > 0 ? ((maintenanceCount / totalCount) * 100).toFixed(1) : 0;

  // KPIs definition (6 compact KPI cards)
  const kpis = [
    { 
      title: 'Total Assets', 
      value: totalCount, 
      icon: Layers, 
      iconBg: 'bg-primary/10 text-primary',
      subtext: 'Registered items'
    },
    { 
      title: 'Allocated Assets', 
      value: allocatedCount, 
      icon: CheckCircle2, 
      iconBg: 'bg-success/10 text-success',
      subtext: 'Currently deployed'
    },
    { 
      title: 'Available Assets', 
      value: availableCount, 
      icon: Box, 
      iconBg: 'bg-blue-500/10 text-blue-500',
      subtext: 'Ready to check-out'
    },
    { 
      title: 'Active Bookings', 
      value: dashboardData?.active_bookings || 0, 
      icon: Calendar, 
      iconBg: 'bg-tertiary/10 text-tertiary',
      subtext: 'Ongoing bookings'
    },
    { 
      title: 'Open Maintenance', 
      value: maintenanceCount, 
      icon: Wrench, 
      iconBg: 'bg-amber-500/10 text-amber-500',
      subtext: 'Needs technical review'
    },
    ...(dashboardData?.pending_audits !== null ? [
      {
        title: 'Pending Audits',
        value: dashboardData.pending_audits,
        icon: ClipboardList,
        iconBg: 'bg-secondary/10 text-secondary',
        subtext: 'Active cycle scope'
      }
    ] : [
      {
        title: 'Notifications',
        value: dashboardData?.unread_notifications || 0,
        icon: Bell,
        iconBg: 'bg-secondary/10 text-secondary',
        subtext: 'Unread updates'
      }
    ])
  ];

  // Quick Action Config
  const quickActions = [
    { title: 'Register Asset', path: `${basePath}/assets`, icon: Box },
    { title: 'Book Resource', path: `${basePath}/booking`, icon: Calendar },
    { title: 'Allocate Asset', path: `${basePath}/allocation`, icon: UserCheck },
    { title: 'Raise Maintenance', path: `${basePath}/maintenance`, icon: Wrench },
  ];

  // Generate Alert cards based on summary data
  const alertsList = [];
  if (dashboardData?.overdue_returns > 0) {
    alertsList.push({
      type: 'overdue',
      title: 'Overdue Asset Returns',
      desc: `${dashboardData.overdue_returns} allocations have passed their expected return date.`,
      color: 'border-l-error text-error bg-error/5 hover:bg-error/10 border-outline-variant/30',
      icon: ShieldAlert
    });
  }
  if (dashboardData?.maintenance_active > 0) {
    alertsList.push({
      type: 'maintenance',
      title: 'Active Maintenance Work',
      desc: `${dashboardData.maintenance_active} requests require diagnostic review or technician resolution.`,
      color: 'border-l-amber-500 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10 border-outline-variant/30',
      icon: Wrench
    });
  }
  if (dashboardData?.pending_transfers > 0) {
    alertsList.push({
      type: 'transfers',
      title: 'Transfer Approvals Pending',
      desc: `${dashboardData.pending_transfers} asset transfers are waiting on management approval.`,
      color: 'border-l-primary text-primary bg-primary/5 hover:bg-primary/10 border-outline-variant/30',
      icon: ArrowUpRight
    });
  }
  if (dashboardData?.pending_audits > 0) {
    alertsList.push({
      type: 'audits',
      title: 'Pending Audit Review',
      desc: `${dashboardData.pending_audits} active audit cycles are requiring verification of items.`,
      color: 'border-l-secondary text-secondary bg-secondary/5 hover:bg-secondary/10 border-outline-variant/30',
      icon: ClipboardList
    });
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-on-surface">Enterprise Resource Overview</h1>
          <p className="text-sm text-on-surface-variant mt-1 font-medium">Welcome back! Here is a summary of your organization's assets and activities.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-primary text-white hover:bg-primary/95 shadow-sm px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2"
        >
          Download Report
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 6 KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
        {kpis.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div 
              key={idx} 
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider line-clamp-1">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-lg ${kpi.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold font-heading text-on-surface">{kpi.value}</div>
                <div className="text-[10px] text-on-surface-variant font-medium mt-1 line-clamp-1">{kpi.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Row */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((act, idx) => {
            const IconComponent = act.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(act.path)}
                className="flex items-center justify-between px-4 py-3.5 bg-surface-container-low border border-outline-variant/40 hover:border-primary/40 hover:bg-primary/5 rounded-xl text-sm font-semibold text-on-surface transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-outline-variant/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm">{act.title}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (70%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Activity Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-heading font-bold text-on-surface">Recent Activity</h2>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">Real-time logs</span>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-low">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3">
                  <History className="w-6 h-6 text-on-surface-variant" />
                </div>
                <p className="text-sm font-semibold text-on-surface">No activity registered yet</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-[280px]">New activities and assets checked in or booked will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/40 max-h-[420px] overflow-y-auto pr-1">
                {activities.map((log) => {
                  const details = getActivityDetails(log);
                  const Icon = details.icon;
                  return (
                    <div key={log.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-3 group">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg border ${details.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{details.message}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
                            Entity type: {log.entity_type}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium flex-shrink-0">
                        {formatTimeAgo(log.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Utilization Analytics Placeholder */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-heading font-bold text-on-surface">Utilization Analytics</h2>
              </div>
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="border border-outline-variant/40 rounded-xl p-4 bg-surface-container-low flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Asset Allocation Rate</span>
                  <div className="text-3xl font-bold font-heading text-on-surface mt-2">{allocationRate}%</div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${allocationRate}%` }}></div>
                  </div>
                  <span className="block text-[10px] text-on-surface-variant mt-1.5 font-semibold">
                    {allocatedCount} of {totalCount} assets deployed
                  </span>
                </div>
              </div>

              <div className="border border-outline-variant/40 rounded-xl p-4 bg-surface-container-low flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Maintenance Load</span>
                  <div className="text-3xl font-bold font-heading text-on-surface mt-2">{maintenanceRatio}%</div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(maintenanceRatio * 5, 100)}%` }}></div>
                  </div>
                  <span className="block text-[10px] text-on-surface-variant mt-1.5 font-semibold">
                    {maintenanceCount} active tickets open
                  </span>
                </div>
              </div>

              <div className="border border-outline-variant/40 rounded-xl p-4 bg-surface-container-low flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Bookings</span>
                  <div className="text-3xl font-bold font-heading text-on-surface mt-2">{dashboardData?.active_bookings || 0}</div>
                </div>
                <div className="mt-4">
                  <span className="block text-xs font-medium text-on-surface-variant">
                    Ongoing bookable resource leases currently active
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-outline-variant/60 rounded-xl p-5 text-center bg-surface mt-6">
              <p className="text-sm font-semibold text-on-surface">Utilization Analytics coming soon</p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                Advanced telemetry modules and timeline allocation charts are currently under development.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column (30%) */}
        <div className="space-y-6">
          
          {/* Recent Alerts Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col min-h-[300px]">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-7 h-7 rounded-lg bg-error/10 text-error flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-heading font-bold text-on-surface">Recent Alerts</h2>
            </div>

            {alertsList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center border border-dashed border-outline-variant/40 rounded-2xl bg-surface-container-low p-4">
                <div className="w-10 h-10 rounded-full bg-success-container/20 text-success flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-on-surface">All Systems Clear</p>
                <p className="text-xs text-on-surface-variant mt-1">No urgent alerts or overdue returns reported today.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertsList.map((alert, idx) => {
                  const AlertIcon = alert.icon;
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-3.5 p-4 rounded-xl border-l-4 ${alert.color} border border-outline-variant/30 hover:shadow-sm transition-all duration-200`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface">{alert.title}</h4>
                        <p className="text-xs text-on-surface-variant mt-1 font-medium">{alert.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
