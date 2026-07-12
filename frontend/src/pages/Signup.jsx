import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';

// Define the validation schema using Zod
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  terms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
});

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    // Simulate a network request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Signup attempt with:', data);
    
    // Show a success toast
    toast.success('Account created successfully! Welcome to AssetFlow.');
    
    // Route to login
    navigate('/login');
  };

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
        </div>
      </section>

      {/* Right Side: Signup Form */}
      <section className="w-full lg:w-1/2 h-full bg-surface-container-lowest flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6 my-auto py-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center lg:items-start space-y-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              <span className="text-xl font-extrabold font-heading tracking-tight">AssetFlow</span>
            </div>
            <h2 className="text-2xl font-semibold font-heading text-on-surface">Create an Account</h2>
            <p className="text-sm text-on-surface-variant">Sign up to start managing your enterprise assets.</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="name">Full Name</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors ${errors.name ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>person</span>
                <input 
                  className={`w-full h-[44px] pl-[42px] pr-4 rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.name ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                  }`} 
                  id="name" 
                  placeholder="Alex Carter" 
                  type="text"
                  {...register('name')}
                />
              </div>
              {errors.name && <p className="text-xs font-semibold text-error mt-1">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors ${errors.email ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>mail</span>
                <input 
                  className={`w-full h-[44px] pl-[42px] pr-4 rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.email ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                  }`} 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs font-semibold text-error mt-1">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="password">Password</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors ${errors.password ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>lock</span>
                <input 
                  className={`w-full h-[44px] pl-[42px] pr-[42px] rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.password ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                  }`}
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                />
                <button 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              {errors.password && <p className="text-xs font-semibold text-error mt-1">{errors.password.message}</p>}
            </div>
            
            <div className="flex flex-col gap-1 py-1">
              <div className="flex items-start gap-2">
                <input 
                  className="w-4 h-4 mt-0.5 rounded border-outline-variant text-primary focus:ring-primary" 
                  id="terms" 
                  type="checkbox" 
                  {...register('terms')}
                />
                <label className="text-xs text-on-surface-variant select-none" htmlFor="terms">
                  I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </label>
              </div>
              {errors.terms && <p className="text-xs font-semibold text-error">{errors.terms.message}</p>}
            </div>
            <button 
              className="w-full h-[48px] bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
              {!isSubmitting && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-surface-container-lowest text-outline font-semibold uppercase">OR SIGN UP WITH SSO</span>
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
          <footer className="pt-6 text-center">
            <p className="text-xs text-on-surface-variant">
              Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In here</Link>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
