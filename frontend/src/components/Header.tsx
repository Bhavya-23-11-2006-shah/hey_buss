import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Logo } from './Logo';
import { SettingsIcon, MicIcon, BlindIcon, DeafIcon, WheelchairIcon } from './Icons';

interface HeaderProps {
  onTalkClick?: () => void;
  isListening?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onTalkClick, isListening = false }) => {
  const profile = useStore((state) => state.profile);
  const setProfile = useStore((state) => state.setProfile);
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const nextLang = profile.language === 'en' ? 'hi' : 'en';
    setProfile({ language: nextLang });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-300">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="p-1 rounded-btn focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cobalt"
          aria-label="Hey Buss - Go to Homepage"
        >
          <Logo size="md" />
        </Link>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Needs Badges */}
          <div className="hidden lg:flex items-center gap-1.5" aria-label="Active accessibility profile">
            {profile.needs.includes('blind') && (
              <span
                title="Blind Mode Active (Voice assistance & double-tap)"
                className="p-1.5 bg-blue-50 text-cobalt border border-blue-200 rounded-btn"
                aria-label="Blind Mode Active"
              >
                <BlindIcon size={18} />
              </span>
            )}
            {profile.needs.includes('deaf') && (
              <span
                title="Deaf Mode Active (Captions & Vibration)"
                className="p-1.5 bg-yellow-50 text-amber-800 border border-yellow-200 rounded-btn"
                aria-label="Deaf Mode Active"
              >
                <DeafIcon size={18} />
              </span>
            )}
            {profile.needs.includes('wheelchair') && (
              <span
                title="Wheelchair Mode Active (Ramp buses & bay tracking)"
                className="p-1.5 bg-green-50 text-success border border-green-200 rounded-btn"
                aria-label="Wheelchair Mode Active"
              >
                <WheelchairIcon size={18} />
              </span>
            )}
          </div>

          {/* Desktop Raised Talk Button in Header */}
          {onTalkClick && (
            <button
              type="button"
              onClick={onTalkClick}
              className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-btn font-black text-sm uppercase tracking-wide border-2 border-black/10 transition-all shadow-sm ${
                isListening
                  ? 'bg-danger text-white animate-pulse'
                  : 'bg-marigold text-ink hover:brightness-105 active:scale-95'
              }`}
              style={{ backgroundColor: isListening ? '#E5213B' : '#FFB800' }}
              aria-label={isListening ? 'Stop listening' : 'Start voice booking'}
            >
              <MicIcon size={18} />
              <span>{isListening ? 'Listening...' : 'Talk'}</span>
            </button>
          )}

          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="min-h-[40px] px-3 py-1.5 border border-neutral-300 bg-surface font-extrabold text-xs uppercase rounded-btn hover:bg-neutral-200 transition-colors focus-visible:ring-3 focus-visible:ring-cobalt"
            aria-label={`Switch language. Currently: ${profile.language === 'en' ? 'English' : 'Hindi'}`}
          >
            {profile.language === 'en' ? 'हिंदी' : 'ENG'}
          </button>

          {/* Settings button */}
          <button
            type="button"
            onClick={() => navigate('/app/settings')}
            className="min-h-[40px] min-w-[40px] p-2 border border-neutral-300 bg-surface rounded-btn hover:bg-neutral-200 text-ink transition-colors flex items-center justify-center focus-visible:ring-3 focus-visible:ring-cobalt"
            aria-label="Accessibility and App Settings"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
