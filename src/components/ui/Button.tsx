import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 focus:ring-indigo-500 shadow-sm shadow-indigo-500/20',
    secondary:
      'bg-slate-800 text-slate-200 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 focus:ring-slate-500',
    outline:
      'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white focus:ring-slate-500',
    ghost:
      'text-slate-400 hover:text-white hover:bg-slate-800/60 focus:ring-slate-500',
    danger:
      'bg-rose-600/90 text-white hover:bg-rose-600 active:bg-rose-700 focus:ring-rose-500 shadow-sm shadow-rose-500/20',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 focus:ring-emerald-500 shadow-sm shadow-emerald-500/20',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2 text-slate-400 hover:text-white',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={14} className="animate-spin mr-1.5" />}
      {children}
    </button>
  );
};
