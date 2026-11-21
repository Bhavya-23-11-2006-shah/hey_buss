import React from 'react';
import { useStore } from '../store/useStore';
import { Logo } from './Logo';
import { SosButton } from './SosButton';
import { BlindIcon, DeafIcon, WheelchairIcon } from './Icons';
import { BackendStatus } from './BackendStatus';

export const Header: React.FC = () => {
  const profile = useStore((state) => state.profile);
  const setProfile = useStore((state) => state.setProfile);
  const currentScreen = useStore((state) => state.currentScreen);
  const setScreen = useStore((state) => state.setScreen);

  const toggleLanguage = () => {
    const nextLang = profile.language === 'en' ? 'hi' : 'en';
    setProfile({ language: nextLang });
  };

  return (
    <header className="bg-paper border-b-2 border-ink">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-signal-yellow focus:text-ink focus:px-4 focus:py-2 focus:border-3 focus:border-ink focus:font-black focus:shadow-hard"
      >
        Skip to main content
      </a>

      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          type="button"
          onClick={() => setScreen(currentScreen === 'landing' ? 'landing' : 'home')}
          className="p-1 rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink"
          aria-label="Hey Buss - Go to Home"
        >
          <Logo size="md" />
        </button>

        {/* Right side controls: Mode indicators, Language, Settings, SOS */}
        <div className="flex items-center gap-2">
          {/* Active Needs Badges */}
          <div className="hidden sm:flex items-center gap-1">
            {profile.needs.includes('blind') && (
              <span
                title="Blind Mode Active (Speech Enabled)"
                className="p-1.5 bg-signal-yellow border border-ink rounded text-ink"
                aria-label="Blind Mode Active"
              >
                <BlindIcon size={18} />
              </span>
            )}
            {profile.needs.includes('deaf') && (
              <span
                title="Deaf Mode Active (Captions & Vibration)"
                className="p-1.5 bg-signal-yellow border border-ink rounded text-ink"
                aria-label="Deaf Mode Active"
              >
                <DeafIcon size={18} />
              </span>
            )}
            {profile.needs.includes('wheelchair') && (
              <span
                title="Wheelchair Mode Active (Ramp Buses Only)"
                className="p-1.5 bg-signal-yellow border border-ink rounded text-ink"
                aria-label="Wheelchair Mode Active"
              >
                <WheelchairIcon size={18} />
              </span>
            )}
          </div>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="min-h-[44px] px-2.5 py-1.5 border-2 border-ink bg-white font-extrabold text-sm uppercase rounded shadow-hard-sm hover:bg-signal-yellow transition-colors focus-visible:ring-4 focus-visible:ring-ink"
            aria-label={`Switch language. Current: ${profile.language === 'en' ? 'English' : 'Hindi'}`}
          >
            {profile.language === 'en' ? 'हिंदी' : 'ENG'}
          </button>

          {/* Profile / Preferences Screen Link */}
          {currentScreen !== 'onboarding' && (
            <button
              type="button"
              onClick={() => setScreen('onboarding')}
              className="min-h-[44px] px-2.5 py-1.5 border-2 border-ink bg-white font-bold text-sm rounded shadow-hard-sm hover:bg-neutral-100 transition-colors focus-visible:ring-4 focus-visible:ring-ink"
              aria-label="Edit Assistance Profile and Needs"
            >
              Profile
            </button>
          )}

          {/* Emergency SOS button */}
          <SosButton />
        </div>
      </div>
      <BackendStatus />
    </header>
  );
};
