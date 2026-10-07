import React from 'react';
import {
  Settings as SettingsIcon,
  Eye,
  Type,
  FastForward,
  Keyboard,
  Sun,
  Moon,
  Sparkles,
  Check,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer.js';
import { Card } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { useAccessibility, ContrastTheme, FontSizeScale } from '../context/AccessibilityContext.js';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    dyslexicFont,
    setDyslexicFont,
    speechRate,
    setSpeechRate,
    announce,
  } = useAccessibility();

  const themes: Array<{ id: ContrastTheme; name: string; desc: string; preview: string }> = [
    {
      id: 'default',
      name: 'Default Clean',
      desc: 'Standard modern accessible palette with subtle blue accents.',
      preview: 'bg-slate-50 border-slate-200 text-slate-900',
    },
    {
      id: 'dark',
      name: 'High Contrast Dark',
      desc: 'Dark background designed to reduce glare and eye fatigue.',
      preview: 'bg-slate-900 border-slate-700 text-slate-100',
    },
    {
      id: 'yellow-black',
      name: 'Yellow on Black',
      desc: 'Recommended high-contrast pairing for severe visual impairment and photophobia.',
      preview: 'bg-black border-yellow-400 text-yellow-400',
    },
    {
      id: 'high-contrast-light',
      name: 'Monochrome High Contrast',
      desc: 'Pure crisp black on pure white for maximum edge definition.',
      preview: 'bg-white border-black text-black',
    },
  ];

  const fontSizes: Array<{ id: FontSizeScale; name: string; sample: string }> = [
    { id: 'normal', name: 'Default Size (100%)', sample: 'Aa' },
    { id: 'large', name: 'Large Size (115%)', sample: 'Aa' },
    { id: 'xlarge', name: 'Extra Large (130%)', sample: 'Aa' },
  ];

  return (
    <PageContainer title="Application Settings">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-brand-600" />
            Display & Assistive Settings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Customize visual contrast, typography scaling, and assistive audio playback.
          </p>
        </div>

        {/* Contrast Themes Section */}
        <Card>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
            <Eye className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Color Contrast & Visual Themes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  theme === t.id
                    ? 'border-brand-500 ring-2 ring-brand-400 bg-brand-50/40 dark:bg-brand-950/40'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
                aria-pressed={theme === t.id}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {t.name}
                    </span>
                    {theme === t.id && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    {t.desc}
                  </p>
                </div>

                <div className={`p-2.5 rounded-xl border text-xs font-semibold ${t.preview}`}>
                  Preview: Sample Text
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Typography & Font Scaling */}
        <Card>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
            <Type className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Typography & Text Sizing
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Base Text Size
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {fontSizes.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontSize(f.id)}
                    className={`p-3.5 rounded-2xl border text-center transition ${
                      fontSize === f.id
                        ? 'border-brand-500 ring-2 ring-brand-400 bg-brand-50/50 dark:bg-brand-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                    aria-pressed={fontSize === f.id}
                  >
                    <span className="block text-2xl font-bold mb-1 text-slate-900 dark:text-white">
                      {f.sample}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {f.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dyslexia friendly toggle */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Dyslexia-Friendly Typography Spacing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-0.5">
                  Applies wider letter-spacing, enhanced line height, and accessible character weighting to ease reading.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={dyslexicFont}
                onClick={() => setDyslexicFont(!dyslexicFont)}
                className={`w-12 h-7 rounded-full p-1 transition duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-brand-400 ${
                  dyslexicFont ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Toggle dyslexia-friendly font"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition duration-200 ease-in-out ${
                    dyslexicFont ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Audio Reading Playback Speed */}
        <Card>
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
            <FastForward className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Text-to-Speech Playback Speed
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Default Speech Rate
              </span>
              <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                {speechRate.toFixed(1)}x
              </span>
            </div>

            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
              aria-label="Adjust speech playback speed"
            />

            <div className="flex justify-between text-xs text-slate-400">
              <span>0.8x (Slower)</span>
              <span>1.0x (Normal)</span>
              <span>1.5x (Faster)</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
