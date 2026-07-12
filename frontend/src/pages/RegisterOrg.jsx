import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';

// Define the validation schema using Zod
const registerOrgSchema = z.object({
  org_name: z.string().min(2, 'Organization Name must be at least 2 characters'),
  org_slug: z.string().min(2, 'Organization Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and dashes only'),
  admin_name: z.string().min(2, 'Admin Name must be at least 2 characters'),
  admin_email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  admin_password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
  terms: z.boolean().refine((val) => val === true, 'You must agree to the terms'),
});

export default function RegisterOrg() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerOrgSchema),
  });

  const onSubmit = async (data) => {
    try {
      await apiClient.post('/auth/register-organization', {
        org_name: data.org_name,
        org_slug: data.org_slug,
        admin_name: data.admin_name,
        admin_email: data.admin_email,
        admin_password: data.admin_password
      });
      
      toast.success('Organization created successfully! You can now log in as Admin.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create organization.');
    }
  };

  return (
    <main className="flex min-h-screen w-full overflow-hidden bg-background font-sans text-on-surface">
      {/* Left Side: Visual/Brand Side */}
      <section className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden items-center justify-center">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary blur-[120px]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center px-8 text-center">
          <div className="relative w-full max-w-md mb-4 lg:mb-6 flex-shrink min-h-0" style={{ animation: 'float 6s ease-in-out infinite' }}>
            <img 
              className="w-full h-auto max-h-[35vh] lg:max-h-[45vh] object-contain drop-shadow-2xl mx-auto" 
              alt="A sophisticated abstract 3D geometric composition" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTKOAKP7DrLmv52wNuIAtSTWfsm3OCI7n7IcyoiknZ0oMzt0NelC0RM2oEoOKNqAyRP2yiCWNDcfOWbZwZx4Gs965vdE4RsMPGVNhHGgpRqePsZWcuqFEMIxgPxyA-2AHm1W_LFavzW3FI4UlGoPaIJP8taAoeSAyoAWU9xFRtbpb0GycJSwW-5G0L3N8W5LLmrUH0yFl7CO9li55ArRXY6Zniu5FE5AnYHPGKUqR75RDZB2lGELhSbQ"
            />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl lg:text-4xl font-bold font-heading text-on-primary-container">Scale Your Business.</h1>
            <p className="text-base lg:text-lg text-on-primary-container/80">
              Set up your enterprise workspace and bring your entire team onboard in minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Right Side: Register Org Form */}
      <section className="w-full lg:w-1/2 h-full bg-surface-container-lowest flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-6 my-auto py-8">
          {/* Brand Header */}
          <div className="flex flex-col items-center lg:items-start space-y-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
              <span className="text-xl font-extrabold font-heading tracking-tight">AssetFlow</span>
            </div>
            <h2 className="text-2xl font-semibold font-heading text-on-surface">Register Workspace</h2>
            <p className="text-sm text-on-surface-variant">Create a new organization and your admin account.</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface-variant block" htmlFor="org_name">Org Name</label>
                <div className="relative group">
                  <input 
                    className={`w-full h-[44px] px-4 rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      errors.org_name ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`} 
                    id="org_name" 
                    placeholder="Acme Corp" 
                    type="text"
                    {...register('org_name')}
                  />
                </div>
                {errors.org_name && <p className="text-xs font-semibold text-error mt-1">{errors.org_name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-on-surface-variant block" htmlFor="org_slug">Org Slug</label>
                <div className="relative group">
                  <input 
                    className={`w-full h-[44px] px-4 rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      errors.org_slug ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`} 
                    id="org_slug" 
                    placeholder="acme-corp" 
                    type="text"
                    {...register('org_slug')}
                  />
                </div>
                {errors.org_slug && <p className="text-xs font-semibold text-error mt-1">{errors.org_slug.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="admin_name">Admin Name</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors ${errors.admin_name ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>person</span>
                <input 
                  className={`w-full h-[44px] pl-[42px] pr-4 rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.admin_name ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                  }`} 
                  id="admin_name" 
                  placeholder="Alex Carter" 
                  type="text"
                  {...register('admin_name')}
                />
              </div>
              {errors.admin_name && <p className="text-xs font-semibold text-error mt-1">{errors.admin_name.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="admin_email">Admin Email Address</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors ${errors.admin_email ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>mail</span>
                <input 
                  className={`w-full h-[44px] pl-[42px] pr-4 rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.admin_email ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                  }`} 
                  id="admin_email" 
                  placeholder="name@company.com" 
                  type="email"
                  {...register('admin_email')}
                />
              </div>
              {errors.admin_email && <p className="text-xs font-semibold text-error mt-1">{errors.admin_email.message}</p>}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="admin_password">Admin Password</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors ${errors.admin_password ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>lock</span>
                <input 
                  className={`w-full h-[44px] pl-[42px] pr-[42px] rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.admin_password ? 'border-error focus:ring-error/20 focus:border-error' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                  }`}
                  id="admin_password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  {...register('admin_password')}
                />
                <button 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
              {errors.admin_password && <p className="text-xs font-semibold text-error mt-1">{errors.admin_password.message}</p>}
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
              {isSubmitting ? 'Registering Workspace...' : 'Register Workspace'}
              {!isSubmitting && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </form>

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
