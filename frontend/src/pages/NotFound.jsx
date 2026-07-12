import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen w-full flex-col bg-surface text-on-surface font-sans selection:bg-primary/20">
      
      {/* Top Navbar matching GitHub's utility style */}
      <header className="h-[64px] border-b border-outline-variant bg-surface-container-lowest flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          <span className="text-xl font-extrabold font-heading tracking-tight text-on-surface">AssetFlow</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-on-surface-variant">
          <button onClick={() => navigate('/admin/dashboard')} className="hover:text-primary transition-colors">Dashboard</button>
          <button onClick={() => navigate('/admin/assets')} className="hover:text-primary transition-colors">Assets</button>
          <button className="hover:text-primary transition-colors">Support</button>
        </nav>
      </header>

      {/* Main Content Area - Clean, Typography focused like modern SaaS */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        
        {/* Animated Radar/Search Visual */}
        <div className="relative mb-12 w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-4 border-2 border-primary/40 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center z-10 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">travel_explore</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center max-w-2xl z-10 space-y-6">
          <h1 className="text-8xl md:text-[150px] font-black font-heading tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary to-secondary leading-none drop-shadow-sm">
            404
          </h1>
          
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-on-surface">
              This is not the asset you are looking for.
            </h2>
            <p className="text-base text-on-surface-variant max-w-md mx-auto">
              The page or resource you requested seems to be missing from the registry. Let's get you back on track.
            </p>
          </div>
        </div>

        {/* Utility Search Bar (Like GitHub) */}
        <div className="mt-12 w-full max-w-xl z-10">
          <p className="text-sm font-semibold text-on-surface-variant mb-3 text-center">Find assets, reports, and employees:</p>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text"
              placeholder="Search AssetFlow..."
              className="w-full h-14 pl-12 pr-32 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm text-on-surface transition-all"
            />
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-surface-container-high hover:bg-primary hover:text-white text-on-surface text-sm font-bold rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs font-medium text-on-surface-variant bg-surface border-t border-outline-variant z-10">
        <p className="flex items-center justify-center gap-4">
          <span className="hover:text-primary cursor-pointer transition-colors">Contact Support</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span className="hover:text-primary cursor-pointer transition-colors">System Status</span>
          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
          <span className="hover:text-primary cursor-pointer transition-colors">@AssetFlow</span>
        </p>
      </footer>
    </main>
  );
}
