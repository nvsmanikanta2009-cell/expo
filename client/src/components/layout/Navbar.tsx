import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Accessibility,
  History,
  LayoutDashboard,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  VolumeX,
  Eye,
  Type,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    isSpeaking,
    stopSpeaking,
    profile,
  } = useAccessibility();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleTheme = () => {
    if (theme === 'default') setTheme('dark');
    else if (theme === 'dark') setTheme('yellow-black');
    else if (theme === 'yellow-black') setTheme('high-contrast-light');
    else setTheme('default');
  };

  const toggleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Product Name */}
          <Link
            to={user ? '/dashboard' : '/'}
            className="flex items-center gap-3 focus:ring-4 focus:ring-brand-500 rounded-lg p-1"
            aria-label="AI Accessibility Assistant Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Accessibility className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Accessibility<span className="text-brand-600 dark:text-brand-400">AI</span>
              </span>
              <span className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium">
                Inclusion Assistant
              </span>
            </div>
          </Link>

          {/* Accessibility Quick Toolbar (Always Visible) */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700"
            role="toolbar"
            aria-label="Quick Accessibility Controls"
          >
            {/* Font Size Cycle */}
            <button
              onClick={toggleFontSize}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 focus:ring-2 focus:ring-brand-500 flex items-center gap-1 transition"
              title={`Adjust text size (Current: ${fontSize})`}
              aria-label={`Adjust text size, current size is ${fontSize}`}
            >
              <Type className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline uppercase text-[10px] tracking-wider">{fontSize}</span>
            </button>

            {/* Contrast Theme Cycle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 focus:ring-2 focus:ring-brand-500 flex items-center gap-1 transition"
              title={`Toggle contrast theme (Current: ${theme})`}
              aria-label={`Toggle contrast theme, current theme is ${theme}`}
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline capitalize text-[10px] tracking-wider">{theme.replace('-', ' ')}</span>
            </button>

            {/* Active Voice Stop Button */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white animate-pulse flex items-center gap-1 hover:bg-red-700 focus:ring-2 focus:ring-red-400"
                aria-label="Stop speech reading"
              >
                <VolumeX className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Stop Audio</span>
              </button>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            <Link
              to="/accessibility"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                isActive('/accessibility')
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              Workspace
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  Dashboard
                </Link>

                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    isActive('/history')
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <History className="w-4 h-4" aria-hidden="true" />
                  History
                </Link>

                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                    isActive('/profile')
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserIcon className="w-4 h-4" aria-hidden="true" />
                  Profile
                </Link>

                <Link
                  to="/settings"
                  className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                    isActive('/settings') ? 'bg-slate-100 dark:bg-slate-800 text-brand-600' : ''
                  }`}
                  aria-label="Application Settings"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" aria-hidden="true" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center gap-1.5 focus:ring-2 focus:ring-red-500"
                  aria-label="Sign out of account"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition focus:ring-4 focus:ring-brand-400"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-4 focus:ring-brand-500"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 shadow-xl">
          <Link
            to="/accessibility"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Sparkles className="w-5 h-5 text-brand-600" />
            Workspace
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="w-5 h-5 text-slate-600" />
                Dashboard
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <History className="w-5 h-5 text-slate-600" />
                History
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <UserIcon className="w-5 h-5 text-slate-600" />
                Accessibility Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Settings className="w-5 h-5 text-slate-600" />
                Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg font-semibold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg font-semibold bg-brand-600 text-white shadow"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
