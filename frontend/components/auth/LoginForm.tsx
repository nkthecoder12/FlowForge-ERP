'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">Email Address</label>
        <div className="relative">
          <input
            {...register('email')}
            type="email"
            className={`input-field ${errors.email ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
            placeholder="admin@flowforge.com"
            autoComplete="email"
            disabled={isLoggingIn}
          />
        </div>
        {errors.email && (
          <p className="text-rose-400 text-xs mt-1 animate-slide-up">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-300">Password</label>
          <a href="#" className="text-xs text-brand hover:text-brand-hover transition-colors">Forgot password?</a>
        </div>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className={`input-field pr-10 ${errors.password ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoggingIn}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-rose-400 text-xs mt-1 animate-slide-up">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          {...register('rememberMe')}
          id="rememberMe"
          type="checkbox"
          className="w-4 h-4 rounded border-surface-border bg-surface-input text-brand focus:ring-brand focus:ring-offset-surface-card"
          disabled={isLoggingIn}
        />
        <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-400 cursor-pointer">
          Remember me for 7 days
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoggingIn}
        className="btn-primary w-full mt-2"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Authenticating...
          </>
        ) : (
          <>
            <LogIn size={20} />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}
