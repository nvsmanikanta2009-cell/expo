import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilityProfile } from '../../../shared/types/index.js';
import { useAuth } from './AuthContext.js';

export type ContrastTheme = 'default' | 'dark' | 'yellow-black' | 'high-contrast-light';
export type FontSizeScale = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  theme: ContrastTheme;
  setTheme: (theme: ContrastTheme) => void;
  fontSize: FontSizeScale;
  setFontSize: (size: FontSizeScale) => void;
  dyslexicFont: boolean;
  setDyslexicFont: (enabled: boolean) => void;
  screenReaderAnnouncement: string;
  announce: (message: string) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  profile: AccessibilityProfile | null;
  saveProfilePreferences: (prefs: Partial<AccessibilityProfile>) => Promise<boolean>;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ContrastTheme>(() => {
    return (localStorage.getItem('access_theme') as ContrastTheme) || 'default';
  });
  const [fontSize, setFontSizeState] = useState<FontSizeScale>(() => {
    return (localStorage.getItem('access_fontsize') as FontSizeScale) || 'normal';
  });
  const [dyslexicFont, setDyslexicFontState] = useState<boolean>(() => {
    return localStorage.getItem('access_dyslexic') === 'true';
  });
  const [speechRate, setSpeechRateState] = useState<number>(() => {
    return parseFloat(localStorage.getItem('access_speechrate') || '1.0');
  });

  const [screenReaderAnnouncement, setScreenReaderAnnouncement] = useState('');
  const [profile, setProfile] = useState<AccessibilityProfile | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync profile when user changes
  useEffect(() => {
    if (user) {
      fetch('/api/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.profile) {
            setProfile(data.profile);
            // If user has specific settings in profile, sync them
            if (data.profile.visualAssistance && theme === 'default') {
              setTheme('yellow-black');
            }
            if (data.profile.readingAssistance && fontSize === 'normal') {
              setFontSize('large');
            }
          }
        })
        .catch(() => {});
    } else {
      setProfile(null);
    }
  }, [user]);

  // Apply DOM classes on changes
  useEffect(() => {
    const body = document.body;
    body.classList.remove('theme-dark', 'theme-yellow-black', 'theme-high-contrast-light');
    if (theme === 'dark') body.classList.add('theme-dark');
    if (theme === 'yellow-black') body.classList.add('theme-yellow-black');
    if (theme === 'high-contrast-light') body.classList.add('theme-high-contrast-light');
    localStorage.setItem('access_theme', theme);
  }, [theme]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('font-size-large', 'font-size-xlarge');
    if (fontSize === 'large') body.classList.add('font-size-large');
    if (fontSize === 'xlarge') body.classList.add('font-size-xlarge');
    localStorage.setItem('access_fontsize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const body = document.body;
    if (dyslexicFont) {
      body.classList.add('font-dyslexic');
    } else {
      body.classList.remove('font-dyslexic');
    }
    localStorage.setItem('access_dyslexic', String(dyslexicFont));
  }, [dyslexicFont]);

  const setTheme = (t: ContrastTheme) => {
    setThemeState(t);
    announce(`Theme changed to ${t}`);
  };

  const setFontSize = (s: FontSizeScale) => {
    setFontSizeState(s);
    announce(`Text size set to ${s}`);
  };

  const setDyslexicFont = (enabled: boolean) => {
    setDyslexicFontState(enabled);
    announce(enabled ? 'Dyslexia friendly font enabled' : 'Dyslexia font disabled');
  };

  const setSpeechRate = (r: number) => {
    setSpeechRateState(r);
    localStorage.setItem('access_speechrate', String(r));
  };

  const announce = (message: string) => {
    setScreenReaderAnnouncement(message);
    // clear after 3 seconds so subsequent identical messages trigger re-announcement
    setTimeout(() => {
      setScreenReaderAnnouncement('');
    }, 3000);
  };

  // Text-to-Speech support via Web Speech API
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      announce('Speech synthesis is not supported on this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    announce('Voice reading started');
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      announce('Voice reading stopped');
    }
  };

  const saveProfilePreferences = async (prefs: Partial<AccessibilityProfile>): Promise<boolean> => {
    if (!user) return false;
    try {
      const merged = {
        visualAssistance: prefs.visualAssistance ?? profile?.visualAssistance ?? false,
        hearingAssistance: prefs.hearingAssistance ?? profile?.hearingAssistance ?? false,
        cognitiveAssistance: prefs.cognitiveAssistance ?? profile?.cognitiveAssistance ?? false,
        readingAssistance: prefs.readingAssistance ?? profile?.readingAssistance ?? false,
        languageAssistance: prefs.languageAssistance ?? profile?.languageAssistance ?? false,
        screenReaderMode: prefs.screenReaderMode ?? profile?.screenReaderMode ?? false,
        preferredLanguage: prefs.preferredLanguage ?? profile?.preferredLanguage ?? 'English',
      };

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        announce('Accessibility preferences updated successfully');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        dyslexicFont,
        setDyslexicFont,
        screenReaderAnnouncement,
        announce,
        speechRate,
        setSpeechRate,
        profile,
        saveProfilePreferences,
        speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {/* Live Region for Screen Readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="accessibility-live-announcer"
      >
        {screenReaderAnnouncement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
