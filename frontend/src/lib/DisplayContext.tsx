import React, { useEffect, useState } from 'react';
import { DisplayContext, type DisplaySettings, type Theme } from './display-context';

const STORAGE_KEY = 'hb-display';

function load(): DisplaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch {}
  return defaults();
}

function defaults(): DisplaySettings {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    theme: prefersDark ? 'dark' : 'light',
    textScale: 100,
    reduceMotion: prefersReduced,
    readAloud: false,
  };
}

export function DisplayProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Apply to <html>
    const html = document.documentElement;
    html.setAttribute('data-theme', settings.theme === 'light' ? '' : settings.theme);
    html.setAttribute('data-reduce-motion', settings.reduceMotion ? 'true' : 'false');
    html.style.fontSize = `${(18 * settings.textScale) / 100}px`;
  }, [settings]);

  const ctx = {
    ...settings,
    setTheme:        (theme: Theme)        => setSettings(s => ({ ...s, theme })),
    setTextScale:    (textScale: number)   => setSettings(s => ({ ...s, textScale })),
    setReduceMotion: (reduceMotion: boolean) => setSettings(s => ({ ...s, reduceMotion })),
    setReadAloud:    (readAloud: boolean)  => setSettings(s => ({ ...s, readAloud })),
  };

  return <DisplayContext.Provider value={ctx}>{children}</DisplayContext.Provider>;
}
