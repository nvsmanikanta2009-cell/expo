import React from 'react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  id,
  label,
  error,
  helperText,
  options,
  className = '',
  required,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = selectId ? `${selectId}-error` : undefined;
  const helperId = selectId ? `${selectId}-helper` : undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
        >
          {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`w-full rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 text-sm transition focus:outline-none focus:ring-4 focus:ring-brand-400 focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed ${
          error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-slate-300 dark:border-slate-700'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
