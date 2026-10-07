import React, { useState, useEffect } from 'react';
import {
  User,
  Sliders,
  Eye,
  BookOpen,
  Brain,
  Volume2,
  Languages,
  CheckCircle,
  Save,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Select } from '../components/ui/Select.js';
import { Alert } from '../components/ui/Alert.js';
import { useAccessibility } from '../context/AccessibilityContext.js';
import { useAuth } from '../context/AuthContext.js';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, saveProfilePreferences, announce } = useAccessibility();

  const [visualAssistance, setVisualAssistance] = useState(false);
  const [readingAssistance, setReadingAssistance] = useState(false);
  const [cognitiveAssistance, setCognitiveAssistance] = useState(false);
  const [hearingAssistance, setHearingAssistance] = useState(false);
  const [languageAssistance, setLanguageAssistance] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setVisualAssistance(profile.visualAssistance);
      setReadingAssistance(profile.readingAssistance);
      setCognitiveAssistance(profile.cognitiveAssistance);
      setHearingAssistance(profile.hearingAssistance);
      setLanguageAssistance(profile.languageAssistance);
      setScreenReaderMode(profile.screenReaderMode);
      setPreferredLanguage(profile.preferredLanguage || 'English');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    const success = await saveProfilePreferences({
      visualAssistance,
      readingAssistance,
      cognitiveAssistance,
      hearingAssistance,
      languageAssistance,
      screenReaderMode,
      preferredLanguage,
    });

    setIsSaving(false);
    if (success) {
      setSuccessMessage('Accessibility preferences successfully saved to your profile.');
      announce('Accessibility profile preferences saved.');
    }
  };

  const preferencesList = [
    {
      id: 'screenReaderMode',
      label: 'Screen Reader Optimized',
      desc: 'Ensures structured ARIA headings, concise linear order, and screen-reader prioritized formats.',
      checked: screenReaderMode,
      onChange: setScreenReaderMode,
      icon: <Volume2 className="w-5 h-5 text-brand-600" />,
    },
    {
      id: 'readingAssistance',
      label: 'Reading & Dyslexia Assistance',
      desc: 'Optimizes typography, line spacing, and provides straightforward sentence structures.',
      checked: readingAssistance,
      onChange: setReadingAssistance,
      icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'cognitiveAssistance',
      label: 'Cognitive & Plain Language Assistance',
      desc: 'Automatically defaults to simplified plain language, breakdown of acronyms, and step-by-step points.',
      checked: cognitiveAssistance,
      onChange: setCognitiveAssistance,
      icon: <Brain className="w-5 h-5 text-purple-600" />,
    },
    {
      id: 'visualAssistance',
      label: 'Visual Assistance & High Contrast',
      desc: 'Enables high contrast color pairings and optimizes visual descriptions for diagrams and pictures.',
      checked: visualAssistance,
      onChange: setVisualAssistance,
      icon: <Eye className="w-5 h-5 text-amber-600" />,
    },
    {
      id: 'hearingAssistance',
      label: 'Hearing Assistance & Transcripts',
      desc: 'Prioritizes detailed text summaries and plain-text alternatives for multimedia content.',
      checked: hearingAssistance,
      onChange: setHearingAssistance,
      icon: <Volume2 className="w-5 h-5 text-rose-600" />,
    },
    {
      id: 'languageAssistance',
      label: 'Language & Translation Assistance',
      desc: 'Provides simplified vocabulary, multilingual translations, and cultural plain-language phrasing.',
      checked: languageAssistance,
      onChange: setLanguageAssistance,
      icon: <Languages className="w-5 h-5 text-emerald-600" />,
    },
  ];

  return (
    <PageContainer title="Accessibility Profile">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-brand-600" />
            Accessibility Profile Preferences
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Personalize your assistive defaults. These preferences are stored securely in your profile and adapt your transformation workflows.
          </p>
        </div>

        {successMessage && (
          <Alert type="success" title="Preferences Saved">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-base">Account Identity</h2>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assistive Focus Options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preferencesList.map((item) => (
                  <label
                    key={item.id}
                    className={`p-4 rounded-2xl border transition flex items-start gap-3.5 cursor-pointer select-none ${
                      item.checked
                        ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 ring-1 ring-brand-400'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.onChange(e.target.checked)}
                      className="mt-1 w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="max-w-xs">
                <Select
                  label="Preferred Language"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  options={[
                    { value: 'English', label: 'English' },
                    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
                    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
                    { value: 'Spanish', label: 'Spanish (Español)' },
                    { value: 'French', label: 'French (Français)' },
                    { value: 'German', label: 'German (Deutsch)' },
                    { value: 'Japanese', label: 'Japanese (日本語)' },
                    { value: 'Arabic', label: 'Arabic (العربية)' },
                  ]}
                  helperText="Default output language for transformations."
                />
              </div>
            </div>

            <div className="mt-8 pt-4 flex justify-end">
              <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Save Profile Preferences
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </PageContainer>
  );
};
