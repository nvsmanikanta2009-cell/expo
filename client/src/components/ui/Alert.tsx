import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />,
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" aria-hidden="true" />,
    },
  };

  const current = styles[type];
  const role = type === 'error' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={`rounded-2xl border p-4 flex items-start gap-3.5 text-sm ${current.bg} ${className}`}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 space-y-1">
        {title && <h3 className="font-semibold text-sm">{title}</h3>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
