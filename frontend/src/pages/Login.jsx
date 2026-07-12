import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background font-sans text-on-surface">
      {/* Left Side: Visual/Brand Side */}
      <section className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden items-center justify-center">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary blur-[120px]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center px-8 text-center">
          {/* Abstract Illustration */}
          <div className="relative w-full max-w-md mb-4 lg:mb-6 flex-shrink min-h-0" style={{ animation: 'float 6s ease-in-out infinite' }}>
            <img 
              className="w-full h-auto max-h-[35vh] lg:max-h-[45vh] object-contain drop-shadow-2xl mx-auto" 
              alt="A sophisticated abstract 3D geometric composition" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTKOAKP7DrLmv52wNuIAtSTWfsm3OCI7n7IcyoiknZ0oMzt0NelC0RM2oEoOKNqAyRP2yiCWNDcfOWbZwZx4Gs965vdE4RsMPGVNhHGgpRqePsZWcuqFEMIxgPxyA-2AHm1W_LFavzW3FI4UlGoPaIJP8taAoeSAyoAWU9xFRtbpb0GycJSwW-5G0L3N8W5LLmrUH0yFl7CO9li55ArRXY6Zniu5FE5AnYHPGKUqR75RDZB2lGELhSbQ"
            />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl lg:text-4xl font-bold font-heading text-on-primary-container">Master Your Assets.</h1>
            <p className="text-base lg:text-lg text-on-primary-container/80">
              The next-generation ERP for high-performance enterprise resource planning and asset management.
            </p>
          </div>
          {/* Data Micro-Card Overlay */}
          
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full lg:w-1/2 h-full bg-surface-container-lowest flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center lg:items-start space-y-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              <span className="text-xl font-extrabold font-heading tracking-tight">AssetFlow</span>
            </div>
            <h2 className="text-2xl font-semibold font-heading text-on-surface">Welcome Back</h2>
            <p className="text-sm text-on-surface-variant">Enter your credentials to access your dashboard.</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                <input 
                  className="w-full h-[44px] pl-[42px] pr-4 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm" 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-on-surface-variant" htmlFor="password">Password</label>
                <a className="text-xs font-medium text-primary hover:text-primary-fixed-dim transition-colors" href="#">Forgot password?</a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                <input 
                  className="w-full h-[44px] pl-[42px] pr-[42px] rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm" 
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                />
                <button 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 py-1">
              <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" id="remember" type="checkbox"/>
              <label className="text-sm text-on-surface-variant select-none" htmlFor="remember">Remember this device</label>
            </div>
            <button 
              className="w-full h-[48px] bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group mt-2" 
              type="submit"
            >
              Sign In
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-surface-container-lowest text-outline font-semibold uppercase">OR CONTINUE WITH SSO</span>
            </div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-2 gap-4">
            <button className="h-[44px] border border-outline-variant rounded-lg text-sm font-semibold text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="h-[44px] border border-outline-variant rounded-lg text-sm font-semibold text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
              Corporate
            </button>
          </div>

          {/* Footer */}
          <footer className="pt-8 text-center">
            <p className="text-xs text-on-surface-variant flex flex-col gap-2">
              <span>Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign Up here</Link></span>
              <a className="text-primary font-semibold hover:underline" href="#">Contact your administrator</a>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
