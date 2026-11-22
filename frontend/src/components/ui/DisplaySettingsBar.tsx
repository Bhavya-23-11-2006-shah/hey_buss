import React from 'react';
import type { Theme } from '../../lib/display-context';
import { useDisplay } from '../../lib/useDisplay';
import { SunIcon, MoonIcon, ContrastIcon, VolumeIcon } from '../Icons';
import { speakText } from '../../utils/speech';
import { useStore } from '../../store/useStore';

interface DisplaySettingsBarProps {
  className?: string;
}

export const DisplaySettingsBar: React.FC<DisplaySettingsBarProps> = ({ className = '' }) => {
  const { theme, setTheme, textScale, setTextScale, reduceMotion, setReduceMotion } = useDisplay();
  const profile = useStore((state) => state.profile);

  const handleDecreaseText = () => {
    setTextScale(Math.max(100, textScale - 10));
  };

  const handleIncreaseText = () => {
    setTextScale(Math.min(200, textScale + 10));
  };

  const cycleTheme = () => {
    const order: Theme[] = ['light', 'dark', 'hc'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const handleReadAloud = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      const text = mainContent.innerText || 'No text found on page';
      speakText(text.slice(0, 500), profile.language);
    }
  };

  return (
    <div
      role="region"
      aria-label="Display accessibility controls"
      className={`bg-surface border-b border-neutral-300 py-1.5 px-4 text-xs font-bold text-ink flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-muted uppercase tracking-wider text-[11px]">Text Size:</span>
        <button
          type="button"
          onClick={handleDecreaseText}
          disabled={textScale <= 100}
          className="px-2 py-1 rounded bg-white border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40"
          aria-label="Decrease text size"
        >
          A−
        </button>
        <span className="tabular font-mono px-1">{textScale}%</span>
        <button
          type="button"
          onClick={handleIncreaseText}
          disabled={textScale >= 200}
          className="px-2 py-1 rounded bg-white border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40 text-sm font-black"
          aria-label="Increase text size"
        >
          A+
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={cycleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-neutral-300 hover:bg-neutral-100"
          aria-label={`Current theme: ${theme}. Click to change theme`}
        >
          {theme === 'light' && <SunIcon size={14} />}
          {theme === 'dark' && <MoonIcon size={14} />}
          {theme === 'hc' && <ContrastIcon size={14} />}
          <span className="capitalize">{theme === 'hc' ? 'High Contrast' : theme}</span>
        </button>

        {/* Reduce Motion toggle */}
        <button
          type="button"
          onClick={() => setReduceMotion(!reduceMotion)}
          className={`px-2.5 py-1 rounded border transition-colors ${
            reduceMotion ? 'bg-cobalt text-white border-cobalt' : 'bg-white border-neutral-300 text-ink'
          }`}
          aria-pressed={reduceMotion}
          aria-label="Toggle reduced motion"
        >
          {reduceMotion ? 'Motion Off' : 'Motion On'}
        </button>

        {/* Read page aloud button */}
        <button
          type="button"
          onClick={handleReadAloud}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-neutral-300 hover:bg-neutral-100 text-cobalt"
          aria-label="Read page contents aloud"
        >
          <VolumeIcon size={14} />
          <span>Read Page</span>
        </button>
      </div>
    </div>
  );
};
