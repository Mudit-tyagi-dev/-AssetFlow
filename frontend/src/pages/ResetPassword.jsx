import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Password reset token is missing from the URL link.');
      return;
    }
    
    try {
      await apiClient.post('/auth/reset-password', {
        token: token,
        new_password: data.password
      });
      
      toast.success('Your password has been successfully reset! You can now log in.');
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.detail || 'Failed to reset password. The link may be invalid or expired.');
    }
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
          <div className="relative w-full max-w-md mb-4 lg:mb-6 flex-shrink min-h-0" style={{ animation: 'float 6s ease-in-out infinite' }}>
            <img 
              className="w-full h-auto max-h-[35vh] lg:max-h-[45vh] object-contain drop-shadow-2xl mx-auto" 
              alt="A sophisticated abstract 3D geometric composition" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTKOAKP7DrLmv52wNuIAtSTWfsm3OCI7n7IcyoiknZ0oMzt0NelC0RM2oEoOKNqAyRP2yiCWNDcfOWbZwZx4Gs965vdE4RsMPGVNhHGgpRqePsZWcuqFEMIxgPxyA-2AHm1W_LFavzW3FI4UlGoPaIJP8taAoeSAyoAWU9xFRtbpb0GycJSwW-5G0L3N8W5LLmrUH0yFl7CO9li55ArRXY6Zniu5FE5AnYHPGKUqR75RDZB2lGELhSbQ"
            />
          </div>
          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl lg:text-4xl font-bold font-heading text-on-primary-container">Secure Your Access.</h1>
            <p className="text-base lg:text-lg text-on-primary-container/80">
              Recover your enterprise account securely and efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Right Side: Reset Password Form */}
      <section className="w-full lg:w-1/2 h-full bg-surface-container-lowest flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center lg:items-start space-y-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
              <span className="text-xl font-extrabold font-heading tracking-tight">AssetFlow</span>
            </div>
            <h2 className="text-2xl font-semibold font-heading text-on-surface">Reset Password</h2>
            <p className="text-sm text-on-surface-variant">Please choose a new, secure password for your account.</p>
          </div>

          {!token && (
            <div className="p-4 bg-error-container/20 text-error border border-error/20 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 flex-shrink-0 text-xl">warning</span>
              <div className="text-xs font-semibold">
                Invalid reset link. The reset token is missing. Please initiate a new recovery request.
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="password">New Password</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors ${errors.password ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>lock</span>
                <input 
                  className={`w-full h-[44px] pl-[42px] pr-10 rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.password 
                      ? 'border-error focus:ring-error/20 focus:border-error' 
                      : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                  }`} 
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer inline-flex"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && <p className="text-xs font-semibold text-error mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="confirmPassword">Confirm Password</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors ${errors.confirmPassword ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>lock</span>
                <input 
                  className={`w-full h-[44px] pl-[42px] pr-10 rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.confirmPassword 
                      ? 'border-error focus:ring-error/20 focus:border-error' 
                      : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                  }`} 
                  id="confirmPassword" 
                  placeholder="••••••••" 
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer inline-flex"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs font-semibold text-error mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button 
              className="w-full h-[48px] bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isSubmitting || !token}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              {!isSubmitting && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </form>

          {/* Footer */}
          <footer className="pt-8 text-center">
            <p className="text-xs text-on-surface-variant flex flex-col gap-2">
              <span>Back to <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link></span>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
