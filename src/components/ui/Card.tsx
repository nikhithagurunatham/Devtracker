import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'glow';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-slate-900/90 border border-slate-800 shadow-md',
    subtle: 'bg-slate-900/40 border border-slate-800/60',
    glow: 'bg-slate-900 border border-indigo-500/30 shadow-lg shadow-indigo-500/5',
  };

  return (
    <div
      className={`rounded-xl p-5 text-slate-200 transition-all ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
