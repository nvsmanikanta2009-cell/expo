import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-brand-600 focus:text-white focus:font-semibold focus:rounded-md focus:shadow-xl focus:ring-4 focus:ring-amber-400"
    >
      Skip to main content (Press Enter)
    </a>
  );
};
