import React from 'react';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';
import { SkipLink } from './SkipLink.js';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  className = '',
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <SkipLink />
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 focus:outline-none ${className}`}
        aria-label={title || 'Page Content'}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};
