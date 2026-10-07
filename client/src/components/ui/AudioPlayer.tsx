import React, { useState } from 'react';
import { Volume2, Pause, Play, Square, FastForward } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext.js';

interface AudioPlayerProps {
  text: string;
  label?: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  text,
  label = 'Read aloud with voice',
  className = '',
}) => {
  const { speakText, stopSpeaking, isSpeaking, speechRate, setSpeechRate } = useAccessibility();
  const [isPaused, setIsPaused] = useState(false);

  const handlePlay = () => {
    if (isPaused && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      speakText(text);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    stopSpeaking();
    setIsPaused(false);
  };

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 ${className}`}
      role="region"
      aria-label="Audio speech playback controls"
    >
      <span className="text-xs font-semibold px-2 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
        <Volume2 className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
        {label}
      </span>

      <div className="flex items-center gap-1">
        {!isSpeaking || isPaused ? (
          <button
            onClick={handlePlay}
            disabled={!text.trim()}
            className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm transition focus:outline-none focus:ring-4 focus:ring-brand-400 disabled:opacity-40"
            aria-label={isPaused ? 'Resume voice reading' : 'Start voice reading'}
            title="Play"
          >
            <Play className="w-4 h-4 fill-white" aria-hidden="true" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-4 focus:ring-amber-300"
            aria-label="Pause voice reading"
            title="Pause"
          >
            <Pause className="w-4 h-4 fill-white" aria-hidden="true" />
          </button>
        )}

        {(isSpeaking || isPaused) && (
          <button
            onClick={handleStop}
            className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm transition focus:outline-none focus:ring-4 focus:ring-red-400"
            aria-label="Stop voice reading"
            title="Stop"
          >
            <Square className="w-4 h-4 fill-white" aria-hidden="true" />
          </button>
        )}

        {/* Speed Controls */}
        <div className="flex items-center gap-1 pl-2 border-l border-slate-300 dark:border-slate-700 text-xs">
          <FastForward className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <select
            value={speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded p-1 cursor-pointer"
            aria-label="Voice reading speed rate"
          >
            <option value="0.8">0.8x</option>
            <option value="1.0">1.0x</option>
            <option value="1.2">1.2x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>
      </div>
    </div>
  );
};
