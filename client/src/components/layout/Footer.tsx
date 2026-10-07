import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Keyboard, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-base">
                AI Accessibility & Inclusion Assistant
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Dedicated to dismantling digital barriers. We empower individuals experiencing visual, cognitive, reading, hearing, or language challenges to interact with information independently.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400">
              <ShieldCheck className="w-4 h-4" />
              <span>WCAG 2.1-inspired principles (POUR: Perceivable, Operable, Understandable, Robust)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/accessibility" className="hover:text-brand-600 transition">
                  Transformation Workspace
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-600 transition">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-brand-600 transition">
                  Accessibility Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-brand-600 transition">
                  Display & Contrast Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Accessibility Tips */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-slate-500" />
              Keyboard Shortcuts
            </h3>
            <ul className="space-y-1.5 text-xs">
              <li><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">Tab</kbd> Move focus forward</li>
              <li><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">Shift + Tab</kbd> Move focus back</li>
              <li><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">Enter / Space</kbd> Activate element</li>
              <li><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">Esc</kbd> Close open dialogs</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© {new Date().getFullYear()} AI-Powered Accessibility & Inclusion Assistant. Built with dignified, user-first AI technology.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for universal accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
