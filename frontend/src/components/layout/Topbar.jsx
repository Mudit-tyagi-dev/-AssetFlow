export default function Topbar() {
  return (
    <header className="h-[64px] sticky top-0 z-40 bg-surface border-b border-outline-variant flex justify-between items-center px-6 w-full flex-shrink-0">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input 
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
            placeholder="Search reports, assets, or trends..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 ml-6">
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <div className="h-8 w-px bg-outline-variant mx-2"></div>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-primary text-primary hover:bg-primary-container/10 transition-all rounded-lg font-medium text-sm">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Data
        </button>
      </div>
    </header>
  );
}
