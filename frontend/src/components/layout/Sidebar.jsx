import { NavLink } from 'react-router-dom';

const ALL_NAVIGATION = [
  { name: 'Dashboard', path: 'dashboard', icon: 'dashboard', roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  { name: 'Organization', path: 'departments', icon: 'corporate_fare', roles: ['Admin'] },
  { name: 'Assets', path: 'assets', icon: 'inventory_2', roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  { name: 'Categories', path: 'categories', icon: 'category', roles: ['Admin'] },
  { name: 'Allocation', path: 'allocation', icon: 'assignment_ind', roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  { name: 'Booking', path: 'booking', icon: 'event_available', roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  { name: 'Employees', path: 'employees', icon: 'group', roles: ['Admin'] },
  { name: 'Maintenance', path: 'maintenance', icon: 'build', roles: ['Admin', 'Asset Manager', 'Employee'] },
  { name: 'Audit', path: 'audit', icon: 'fact_check', roles: ['Admin', 'Asset Manager'] },
  { name: 'Reports', path: 'reports', icon: 'analytics', roles: ['Admin', 'Asset Manager', 'Department Head'] },
];

export default function Sidebar({ role, basePath, isOpen, setIsOpen }) {
  const filteredNavigation = ALL_NAVIGATION.filter(item => item.roles.includes(role));

  return (
    <aside 
      className={`w-[260px] h-screen fixed left-0 top-0 bg-surface border-r border-outline-variant flex flex-col py-6 px-2 z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between px-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-on-primary shadow-sm shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary leading-tight font-heading">AssetFlow</h1>
            <p className="text-[10px] uppercase tracking-widest text-outline">Enterprise ERP</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button 
          className="lg:hidden text-on-surface-variant hover:text-on-surface p-1"
          onClick={() => setIsOpen(false)}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={`${basePath}/${item.path}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-sm group transition-colors ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
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
      
      <div className="mt-auto pt-4 border-t border-outline-variant space-y-1 px-2">
        <NavLink to={`${basePath}/notifications`} className="flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors group">
          <span className="material-symbols-outlined group-hover:text-primary">notifications</span>
          <span>Notifications</span>
        </NavLink>
        <NavLink 
          to={`${basePath}/settings`} 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-sm group transition-colors ${
              isActive
                ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`
          }
        >
          <span className="material-symbols-outlined group-hover:text-primary">settings</span>
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
