import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'hc';

export interface DisplaySettings {
  theme: Theme;
  textScale: number;
  reduceMotion: boolean;
  readAloud: boolean;
}

interface DisplayContextValue extends DisplaySettings {
  setTheme: (theme: Theme) => void;
  setTextScale: (scale: number) => void;
  setReduceMotion: (enabled: boolean) => void;
  setReadAloud: (enabled: boolean) => void;
}

const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const DisplayContext = createContext<DisplayContextValue>({
  theme: prefersDark ? 'dark' : 'light',
  textScale: 100,
  reduceMotion: prefersReducedMotion,
  readAloud: false,
  setTheme: () => {},
  setTextScale: () => {},
  setReduceMotion: () => {},
  setReadAloud: () => {},
});
