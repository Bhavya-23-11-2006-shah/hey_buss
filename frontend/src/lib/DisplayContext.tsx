import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'hc';

interface DisplaySettings {
  theme: Theme;
  textScale: number;       // 100–200 (percentage)
  reduceMotion: boolean;
  readAloud: boolean;
}

interface DisplayCtx extends DisplaySettings {
  setTheme: (t: Theme) => void;
  setTextScale: (s: number) => void;
  setReduceMotion: (v: boolean) => void;
  setReadAloud: (v: boolean) => void;
}

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

const Ctx = createContext<DisplayCtx>({
  ...defaults(),
  setTheme: () => {},
  setTextScale: () => {},
  setReduceMotion: () => {},
  setReadAloud: () => {},
});

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

  const ctx: DisplayCtx = {
    ...settings,
    setTheme:        (theme)        => setSettings(s => ({ ...s, theme })),
    setTextScale:    (textScale)    => setSettings(s => ({ ...s, textScale })),
    setReduceMotion: (reduceMotion) => setSettings(s => ({ ...s, reduceMotion })),
    setReadAloud:    (readAloud)    => setSettings(s => ({ ...s, readAloud })),
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export const useDisplay = () => useContext(Ctx);
