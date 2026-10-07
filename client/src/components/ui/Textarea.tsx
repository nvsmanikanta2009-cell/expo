import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxChars?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  error,
  helperText,
  showCharCount = false,
  maxChars,
  className = '',
  value,
  required,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = textareaId ? `${textareaId}-error` : undefined;
  const helperId = textareaId ? `${textareaId}-helper` : undefined;

  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
          </label>
        )}
        {showCharCount && (
          <span className="text-xs text-slate-400" aria-live="polite">
            {currentLength} {maxChars ? `/ ${maxChars}` : 'characters'}
          </span>
        )}
      </div>
      <textarea
        id={textareaId}
        value={value}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={`w-full rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-3 text-sm transition focus:outline-none focus:ring-4 focus:ring-brand-400 focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed ${
          error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-slate-300 dark:border-slate-700'
        } ${className}`}
        {...props}
      />
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
