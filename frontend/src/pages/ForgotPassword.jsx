import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { apiClient } from '../api/client';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await apiClient.post('/auth/forgot-password', {
        email: data.email
      });
      
      toast.success('If that email exists, we have sent a password reset link.');
      reset(); // Clear the form
    } catch (error) {
      console.error('Forgot password error:', error);
      // We generally don't want to expose if an email exists or not, but we can show a generic error
      toast.error('Failed to process request. Please try again later.');
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

      {/* Right Side: Forgot Password Form */}
      <section className="w-full lg:w-1/2 h-full bg-surface-container-lowest flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center lg:items-start space-y-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
              <span className="text-xl font-extrabold font-heading tracking-tight">AssetFlow</span>
            </div>
            <h2 className="text-2xl font-semibold font-heading text-on-surface">Forgot Password?</h2>
            <p className="text-sm text-on-surface-variant">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-on-surface-variant block" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors ${errors.email ? 'text-error' : 'text-outline group-focus-within:text-primary'}`}>mail</span>
                <input 
                  className={`w-full h-[44px] pl-[42px] pr-4 rounded-lg border bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    errors.email 
                      ? 'border-error focus:ring-error/20 focus:border-error' 
                      : 'border-outline-variant focus:ring-primary/20 focus:border-primary'
                  }`} 
                  id="email" 
                  placeholder="name@company.com" 
                  type="email"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs font-semibold text-error mt-1">{errors.email.message}</p>}
            </div>

            <button 
              className="w-full h-[48px] bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary-container hover:text-on-primary-container active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
              {!isSubmitting && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
            </button>
          </form>

          {/* Footer */}
          <footer className="pt-8 text-center">
            <p className="text-xs text-on-surface-variant flex flex-col gap-2">
              <span>Remember your password? <Link to="/login" className="text-primary font-semibold hover:underline">Sign In here</Link></span>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
