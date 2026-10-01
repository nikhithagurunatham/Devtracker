import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3 py-2 text-sm bg-slate-950 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
            error
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-slate-800 hover:border-slate-700'
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-400">{error}</span>}
        {helperText && !error && (
          <span className="text-xs text-slate-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
