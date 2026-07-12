import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';
import { Building2, Users, Loader2, ArrowRight } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const registerOrgSchema = z.object({
  org_name: z.string().min(2, 'Organization Name must be at least 2 characters'),
  org_slug: z.string().min(2, 'Organization Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and dashes only'),
  admin_name: z.string().min(2, 'Admin Name must be at least 2 characters'),
  admin_email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  admin_password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
});

export default function OrganizationSetup() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerOrgSchema),
  });

  const onSubmit = async (data) => {
    try {
      // 1. Create Organization & Admin User
      await apiClient.post('/auth/register-organization', {
        org_name: data.org_name,
        org_slug: data.org_slug,
        admin_name: data.admin_name,
        admin_email: data.admin_email,
        admin_password: data.admin_password
      });

      toast.success('Organization registered successfully! Authenticating...');

      // 2. Automatically log in as the newly created Admin
      const loginRes = await apiClient.post('/auth/login', {
        email: data.admin_email,
        password: data.admin_password
      });

      const { access_token, refresh_token } = loginRes.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      const decoded = jwtDecode(access_token);
      const role = decoded.role;

      // 3. Redirect to dashboard
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'manager') navigate('/manager/dashboard');
      else if (role === 'head') navigate('/head/dashboard');
      else navigate('/user/dashboard');

    } catch (err) {
      console.error('Organization onboarding error:', err);
      toast.error(err.response?.data?.detail || 'Failed to complete organization onboarding setup.');
    }
  };

  return (
    <main className="flex min-h-screen w-full overflow-hidden bg-background font-sans text-on-surface">
      {/* Visual Brand Panel */}
      <section className="hidden lg:flex w-1/2 relative bg-primary-container overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary blur-[120px]"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center px-8 text-center">
          <div className="relative w-full max-w-md mb-6 flex-shrink min-h-0 animate-bounce-subtle">
            <img 
              className="w-full h-auto max-h-[45vh] object-contain drop-shadow-2xl mx-auto" 
              alt="A sophisticated abstract 3D geometric composition representing structure" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTKOAKP7DrLmv52wNuIAtSTWfsm3OCI7n7IcyoiknZ0oMzt0NelC0RM2oEoOKNqAyRP2yiCWNDcfOWbZwZx4Gs965vdE4RsMPGVNhHGgpRqePsZWcuqFEMIxgPxyA-2AHm1W_LFavzW3FI4UlGoPaIJP8taAoeSAyoAWU9xFRtbpb0GycJSwW-5G0L3N8W5LLmrUH0yFl7CO9li55ArRXY6Zniu5FE5AnYHPGKUqR75RDZB2lGELhSbQ"
            />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl font-bold font-heading text-on-primary-container">Workspace Initialization</h1>
            <p className="text-base text-on-primary-container/80 font-medium">
              Create an isolated organizational workspace or request association nodes.
            </p>
          </div>
        </div>
      </section>

      {/* Main Forms Section */}
      <section className="w-full lg:w-1/2 min-h-screen bg-surface-container-lowest flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[460px] space-y-6 py-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col items-center lg:items-start space-y-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
              <span className="text-xl font-extrabold font-heading tracking-tight">AssetFlow</span>
            </div>
            <h2 className="text-2xl font-bold font-heading text-on-surface">Organization Onboarding</h2>
            <p className="text-sm text-on-surface-variant text-center lg:text-left font-medium">
              Your profile is currently not assigned to any organization. Please initialize one to get started.
            </p>
          </div>

          {/* Switch Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-surface-container rounded-xl border border-outline-variant">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Create New
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'join'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Users className="w-4 h-4" />
              Join Existing
            </button>
          </div>

          {activeTab === 'create' ? (
            /* Create Org Form */
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">1. Organization Details</h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant block">Organization Name *</label>
                  <input
                    className={`w-full h-[40px] px-3.5 rounded-lg border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 ${
                      errors.org_name ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="e.g. Acme Corp"
                    type="text"
                    {...register('org_name')}
                  />
                  {errors.org_name && <p className="text-[10px] font-bold text-error">{errors.org_name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant block">Organization Slug *</label>
                  <input
                    className={`w-full h-[40px] px-3.5 rounded-lg border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 ${
                      errors.org_slug ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="e.g. acme-corp"
                    type="text"
                    {...register('org_slug')}
                  />
                  {errors.org_slug && <p className="text-[10px] font-bold text-error">{errors.org_slug.message}</p>}
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant p-4 rounded-xl space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">2. Admin User Details</h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant block">Full Name *</label>
                  <input
                    className={`w-full h-[40px] px-3.5 rounded-lg border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 ${
                      errors.admin_name ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="John Doe"
                    type="text"
                    {...register('admin_name')}
                  />
                  {errors.admin_name && <p className="text-[10px] font-bold text-error">{errors.admin_name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant block">Admin Email *</label>
                  <input
                    className={`w-full h-[40px] px-3.5 rounded-lg border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 ${
                      errors.admin_email ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                    }`}
                    placeholder="admin@company.com"
                    type="email"
                    {...register('admin_email')}
                  />
                  {errors.admin_email && <p className="text-[10px] font-bold text-error">{errors.admin_email.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant block">Admin Password *</label>
                  <div className="relative">
                    <input
                      className={`w-full h-[40px] pl-3.5 pr-10 rounded-lg border bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 ${
                        errors.admin_password ? 'border-error focus:ring-error/20' : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                      }`}
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      {...register('admin_password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer inline-flex"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.admin_password && <p className="text-[10px] font-bold text-error">{errors.admin_password.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[48px] bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/95 transition-all active:scale-[0.98] shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing Org Node...
                  </>
                ) : (
                  <>
                    Create Workspace
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Join Existing Org Placeholder */
            <div className="space-y-6 py-6 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline">
                <Users className="w-8 h-8" />
              </div>
              
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="font-bold text-lg text-on-surface">Request Access</h3>
                <p className="text-sm text-on-surface-variant font-medium">
                  Enter your organization's unique key or identifier token below to request mapping authorization.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 text-left max-w-xs mx-auto">
                  <label className="text-xs font-bold text-on-surface-variant block">Organization UUID Token</label>
                  <input
                    disabled
                    className="w-full h-[40px] px-3.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant text-sm cursor-not-allowed"
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    type="text"
                  />
                </div>

                <div className="p-4 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl max-w-sm mx-auto text-xs font-semibold">
                  Joining an existing organization will be available when the backend API is ready.
                </div>

                <button
                  disabled
                  className="px-6 py-2.5 bg-outline text-white text-sm font-semibold rounded-xl cursor-not-allowed opacity-50"
                >
                  Join Organization
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
