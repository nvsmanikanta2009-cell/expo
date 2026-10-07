import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface AccessibilityScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const AccessibilityScore: React.FC<AccessibilityScoreProps> = ({
  score,
  size = 'md',
  showDetails = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  let colorClasses = {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-400',
    bar: 'bg-emerald-600',
    label: 'High Accessibility',
  };

  if (clampedScore < 50) {
    colorClasses = {
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
      bar: 'bg-red-600',
      label: 'Needs Improvement',
    };
  } else if (clampedScore < 80) {
    colorClasses = {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-400',
      bar: 'bg-amber-500',
      label: 'Moderate Accessibility',
    };
  }

  return (
    <div
      className={`rounded-2xl border p-4 ${colorClasses.bg} ${colorClasses.border}`}
      role="region"
      aria-label={`Accessibility Score: ${clampedScore} out of 100, rating: ${colorClasses.label}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
            <ShieldCheck className={`w-6 h-6 ${colorClasses.text}`} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black tracking-tight ${colorClasses.text}`}>
                {clampedScore}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ 100</span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {colorClasses.label}
            </p>
          </div>
        </div>

        {/* Progress Bar Visual */}
        <div className="hidden sm:block w-36">
          <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${colorClasses.bar}`}
              style={{ width: `${clampedScore}%` }}
              role="progressbar"
              aria-valuenow={clampedScore}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" aria-hidden="true" />
          <span>
            <strong>AI-generated accessibility estimate.</strong> Evaluates clarity, readability, structure, and inclusion. Not an official WCAG compliance certification.
          </span>
        </div>
      )}
    </div>
  );
};
