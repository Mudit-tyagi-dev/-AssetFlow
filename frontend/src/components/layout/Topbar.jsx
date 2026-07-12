export default function Topbar({ role, onMenuClick }) {
  return (
    <header className="h-[64px] sticky top-0 z-30 bg-surface border-b border-outline-variant flex justify-between items-center px-4 lg:px-6 w-full flex-shrink-0">
      <div className="flex items-center gap-2 lg:gap-4 flex-1 max-w-2xl">
        {/* Mobile Hamburger Menu */}
        <button 
          className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input 
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
            placeholder="Search reports, assets..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4 ml-2 lg:ml-6">
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div className="hidden lg:block h-8 w-px bg-outline-variant mx-2"></div>
        
        {/* User Profile Block */}
        <div className="flex items-center gap-3 pl-1 pr-4 py-1 bg-surface-container-low rounded-full border border-outline-variant hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant">
            <img 
              className="w-full h-full object-cover" 
              alt="Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMViWAkHZXuSeJSnnyPFm09xGG6lQ7V_7haY7ffOVJRI8_oWIiZKlDWd_fZgnzVzNnBIc1CXxEAclSHKAlHOX79Vg979XQqtT82BgP9y2hSJAUKWT_jXzmr_cwVoXFhTh4iRa0Q9CJyzkjNkR20a_Zc3Rl1dFzA2axYazfqX05OFNgcVWM2lBjmy4PJ33IDafWTqiCfLRaht11NcqXSTDHA_4o3X8RlS0v-m3OtU-PSZ0tEFqU3ft4lQ"
            />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors leading-tight">Alex Carter</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider leading-none mt-0.5">{role || 'User'}</p>
          </div>
        </div>

      </div>
    </header>
  );
}
