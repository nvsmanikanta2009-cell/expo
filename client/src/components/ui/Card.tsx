import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  elevated = false,
  ...props
}) => {
  return (
    <div
      className={`card-accessible bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 transition-all ${
        elevated ? 'shadow-md dark:shadow-slate-950/40' : 'shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
