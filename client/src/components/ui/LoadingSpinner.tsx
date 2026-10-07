import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading content...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center p-6 space-y-3"
      aria-live="polite"
    >
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-brand-600 dark:text-brand-400`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {label}
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
};
