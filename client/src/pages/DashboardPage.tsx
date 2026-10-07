import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  History,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  User,
  Sliders,
  FileCheck,
  Calendar,
  Volume2,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.js';
import { AccessibilityScore } from '../components/ui/AccessibilityScore.js';
import { useAuth } from '../context/AuthContext.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { TransformationRecord, TransformationStats } from '../../../shared/types/index.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useAccessibility();

  const [stats, setStats] = useState<TransformationStats | null>(null);
  const [recentHistory, setRecentHistory] = useState<TransformationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          fetch('/api/history/stats'),
          fetch('/api/history?limit=5'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setRecentHistory(historyData.history || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <PageContainer title="Dashboard">
        <div className="py-24">
          <LoadingSpinner label="Loading dashboard metrics and history..." size="lg" />
        </div>
      </PageContainer>
    );
  }

  const activeProfileAssistances = [
    profile?.screenReaderMode && 'Screen Reader Mode',
    profile?.visualAssistance && 'Visual Assistance',
    profile?.cognitiveAssistance && 'Cognitive Simplification',
    profile?.readingAssistance && 'Reading Aid',
    profile?.hearingAssistance && 'Hearing Assistance',
    profile?.languageAssistance && 'Language Assistance',
  ].filter(Boolean);

  return (
    <PageContainer title="User Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 text-white shadow-lg">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 bg-white/20 rounded-full inline-block">
              Accessibility Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome, {user?.email.split('@')[0]}
            </h1>
            <p className="text-sm text-brand-100 max-w-xl">
              Track your accessibility metrics, view recent transformations, and customize your assistive browsing preferences.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/accessibility">
              <Button variant="secondary" size="md" leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}>
                New Transformation
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" size="md" className="border-white/40 text-white hover:bg-white/10" leftIcon={<Sliders className="w-4 h-4" />}>
                Preferences
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Transformations
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats?.totalTransformations || 0}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Average Accessibility Score
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.averageScore || 0}
                </p>
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Top Transformation Task
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
                {stats?.mostFrequentTask ? stats.mostFrequentTask.replace('_', ' ') : 'None yet'}
              </p>
            </div>
          </Card>
        </div>

        {/* Accessibility Profile Status Banner */}
        <Card className="border-brand-200 dark:border-brand-900 bg-brand-50/40 dark:bg-brand-950/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Accessibility Profile
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeProfileAssistances.length > 0 ? (
                  activeProfileAssistances.map((name, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200"
                    >
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Standard settings (English)</span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  Language: {profile?.preferredLanguage || 'English'}
                </span>
              </div>
            </div>

            <Link to="/profile">
              <Button variant="outline" size="sm">
                Adjust Preferences
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Transformations Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Recent Transformations
            </h2>
            <Link
              to="/history"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 focus:ring-2 focus:ring-brand-500 rounded p-1"
            >
              View all history <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentHistory.length === 0 ? (
            <Card className="text-center py-12">
              <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No transformations yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                Submit an article, document, notice, or image to generate accessible plain-language or screen-reader formats.
              </p>
              <Link to="/accessibility">
                <Button size="md" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Start First Transformation
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentHistory.map((item) => (
                <Card
                  key={item.id}
                  className="hover:border-slate-300 dark:hover:border-slate-600 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200">
                        {item.task.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                        Need: {item.accessibilityNeed}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate max-w-2xl">
                      {item.originalContent}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                    {item.accessibilityScore !== null && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Score: {item.accessibilityScore}/100
                      </span>
                    )}

                    <Link to={`/history/${item.id}`}>
                      <Button variant="outline" size="sm">
                        View Result
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
