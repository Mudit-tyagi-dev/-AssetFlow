import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'dashboard' },
  { name: 'Asset Management', href: '/assets', icon: 'inventory_2' },
  { name: 'Asset Allocation', href: '/allocation', icon: 'assignment_ind' },
  { name: 'Asset Categories', href: '/categories', icon: 'category' },
  { name: 'Asset Details', href: '/asset/1', icon: 'info' },
  { name: 'Notifications', href: '/notifications', icon: 'notifications' },
  { name: 'Resource Booking', href: '/booking', icon: 'event_available' },
  { name: 'Employee Directory', href: '/employees', icon: 'group' },
  { name: 'Maintenance', href: '/maintenance', icon: 'build' },
  { name: 'Department Management', href: '/departments', icon: 'corporate_fare' },
  { name: 'Audit', href: '/audit', icon: 'fact_check' },
  { name: 'Reports', href: '/reports', icon: 'analytics' },
];

export default function Sidebar() {
  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 bg-surface border-r border-outline-variant flex flex-col py-6 px-2 z-50">
      <div className="flex items-center gap-3 px-4 mb-8">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-primary leading-tight font-heading">AssetFlow</h1>
          <p className="text-[10px] uppercase tracking-widest text-outline">Enterprise ERP</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg font-sans text-sm group transition-colors ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span 
                  className={`material-symbols-outlined ${!isActive ? 'group-hover:text-primary' : ''}`}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-outline-variant">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high">
            <img 
              className="w-full h-full object-cover" 
              alt="Alex Carter" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMViWAkHZXuSeJSnnyPFm09xGG6lQ7V_7haY7ffOVJRI8_oWIiZKlDWd_fZgnzVzNnBIc1CXxEAclSHKAlHOX79Vg979XQqtT82BgP9y2hSJAUKWT_jXzmr_cwVoXFhTh4iRa0Q9CJyzkjNkR20a_Zc3Rl1dFzA2axYazfqX05OFNgcVWM2lBjmy4PJ33IDafWTqiCfLRaht11NcqXSTDHA_4o3X8RlS0v-m3OtU-PSZ0tEFqU3ft4lQ"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">Alex Carter</p>
            <p className="text-xs text-outline truncate">Operations Lead</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
