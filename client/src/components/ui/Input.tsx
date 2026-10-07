import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  required,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;
  const helperId = inputId ? `${inputId}-helper` : undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-4 focus:ring-brand-400 focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : ''
          } ${
            error
              ? 'border-red-500 focus:ring-red-400'
              : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
