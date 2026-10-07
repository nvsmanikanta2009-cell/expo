import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Eye,
  BookOpen,
  Volume2,
  FileText,
  Languages,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  School,
  Building2,
  Briefcase,
  HeartPulse,
  MonitorSmartphone,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { useAuth } from '../context/AuthContext.js';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      title: 'Simplify Complex Text',
      description:
        'Transform dense, convoluted paragraphs and jargon into plain, easy-to-digest language without losing vital meaning.',
    },
    {
      icon: <Volume2 className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      title: 'Screen Reader & Voice Optimization',
      description:
        'Restructure content with logical hierarchies, descriptive labels, and linear flow ideal for assistive audio reading.',
    },
    {
      icon: <Eye className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      title: 'Meaningful Image Descriptions',
      description:
        'Generate objective, descriptive alternative text and detailed visual breakdowns for users with visual disabilities.',
    },
    {
      icon: <FileText className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      title: 'Accessible Summaries',
      description:
        'Condense long articles, notices, and documents into executive takeaways and key actionable points for cognitive ease.',
    },
    {
      icon: <Languages className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      title: 'Inclusive Multilingual Translation',
      description:
        'Translate materials into English, Telugu, Hindi, and more while preserving accessible sentence structures.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />,
      title: 'Accessibility Audits & Scoring',
      description:
        'Receive an AI-estimated accessibility score (0–100) and pinpointed suggestions to eliminate content barriers.',
    },
  ];

  const domains = [
    {
      icon: <School className="w-5 h-5 text-indigo-500" />,
      title: 'Education',
      desc: 'Textbook chapters, assignment guides, and study materials simplified for neurodivergent learners.',
    },
    {
      icon: <Building2 className="w-5 h-5 text-emerald-500" />,
      title: 'Government & Public Info',
      desc: 'Official notices, regulations, and civic forms made accessible and understandable to all citizens.',
    },
    {
      icon: <Briefcase className="w-5 h-5 text-blue-500" />,
      title: 'Workplace',
      desc: 'Internal memos, standard operating procedures, and technical documentation translated to plain language.',
    },
    {
      icon: <HeartPulse className="w-5 h-5 text-rose-500" />,
      title: 'Health & Well-being',
      desc: 'Health guides and medical instructions restructured for plain clarity without clinical jargon.',
    },
    {
      icon: <MonitorSmartphone className="w-5 h-5 text-amber-500" />,
      title: 'Everyday Digital Content',
      desc: 'Websites, social announcements, and digital articles formatted for assistive technologies.',
    },
  ];

  return (
    <PageContainer title="Home">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28 bg-gradient-to-b from-brand-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
              <span>Universal Digital Inclusion Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Make digital information{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:to-indigo-300">
                easier to access, understand, and use.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Empowering people with visual, hearing, reading, and cognitive accessibility needs. Transform dense texts, website articles, and images into clear, structured, and screen-reader-friendly formats with dignified AI.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? '/dashboard' : '/accessibility'}>
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-brand-500/20" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  {user ? 'Open Dashboard' : 'Try Workspace Now'}
                </Button>
              </Link>
              {!user && (
                <Link to="/signup">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Create Free Account
                  </Button>
                </Link>
              )}
            </div>

            {/* Quick Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> WCAG 2.1 POUR Principles
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> High Contrast & Dyslexia Fonts
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Integrated Text-to-Speech
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Original Content → AI Analysis → Accessible Output
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              See how complicated, barrier-heavy information is instantly unlocked for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Before Card */}
            <Card className="border-red-200 dark:border-red-950/60 bg-red-50/20 dark:bg-red-950/10 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold mb-4 uppercase tracking-wider">
                  Original Inaccessible Content
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-base">
                  Dense Bureaucratic Notice:
                </h3>
                <blockquote className="italic text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed">
                  "Pursuant to the aforementioned administrative guidelines, failure to manifest requisite documentation prior to the statutory deadline will inevitably precipitate revocation of preliminary entitlements without further notification."
                </blockquote>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-red-600 dark:text-red-400 font-medium">
                ✕ Complex vocabulary • Poor readability • Unstructured sentence
              </div>
            </Card>

            {/* After Card */}
            <Card className="border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-4 uppercase tracking-wider">
                  AI Simplified & Accessible Version
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-base">
                  Clear Plain Language:
                </h3>
                <div className="text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed space-y-2">
                  <p className="font-medium text-emerald-800 dark:text-emerald-300">
                    Important: Please submit your paperwork before the deadline.
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    If your documents are not received on time, your approval will be cancelled. We will not be able to send another reminder.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>✓ Plain Language • Direct Actionable Steps</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  Est. Score: 96/100
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Designed for Every Accessibility Requirement
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Comprehensive tools to adapt content for screen readers, cognitive simplicity, low vision, and multilingual needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="hover:border-brand-300 dark:hover:border-brand-700 transition">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Target Domains */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Bridging Barriers Across Key Domains
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Supporting citizens, students, employees, and patients in understanding critical materials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((dom, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-4 shadow-sm"
              >
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {dom.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{dom.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{dom.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility Statement Banner */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-brand-600 to-indigo-700 text-white shadow-xl">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur">
              <ShieldCheck className="w-4 h-4" />
              <span>WCAG 2.1 AAA Accessibility Pledge</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Accessibility is our Core Directive.
            </h2>
            <p className="text-sm sm:text-base text-brand-100 leading-relaxed">
              Every element of this platform is engineered for keyboard navigation, high color contrast, screen reader compatibility, and user autonomy. We believe accessibility removes barriers without removing dignity.
            </p>
            <div className="pt-2">
              <Link to="/accessibility">
                <Button variant="secondary" size="lg">
                  Launch Transformation Workspace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};
