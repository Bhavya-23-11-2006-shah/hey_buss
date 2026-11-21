import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useDisplay } from '../lib/DisplayContext';
import type { Need } from '../types';
import { Button } from '../components/ui/Button';
import {
  BlindIcon,
  DeafIcon,
  WheelchairIcon,
  CheckIcon,
  SunIcon,
  MoonIcon,
  ContrastIcon,
  UserIcon,
} from '../components/Icons';
import { speakText, vibrateDevice } from '../utils/speech';

export const SettingsPage: React.FC = () => {
  const profile = useStore((state) => state.profile);
  const setProfile = useStore((state) => state.setProfile);
  const toggleNeed = useStore((state) => state.toggleNeed);
  const toggleHowToHelp = useStore((state) => state.toggleHowToHelp);

  const {
    theme,
    setTheme,
    textScale,
    setTextScale,
    reduceMotion,
    setReduceMotion,
  } = useDisplay();

  // Settings form states
  const [passengerName, setPassengerName] = useState(profile.name || 'Passenger');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98300 12345');
  const [consentLocation, setConsentLocation] = useState(true);
  const [liteMode, setLiteMode] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(0.95);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presetHelps = [
    'I need the hydraulic ramp',
    'Please speak facing me directly',
    'Please wait for me to take my seat',
    'Audio announce my destination stop',
    'Guide me to the dedicated wheelchair bay',
  ];

  const handleNeedClick = (need: Need) => {
    vibrateDevice(50);
    toggleNeed(need);
    if (need === 'blind' && !profile.needs.includes('blind')) {
      speakText('Blind mode enabled. Screen reader and double tap to talk activated.', profile.language);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    vibrateDevice(80);
    setProfile({
      name: passengerName.trim() || 'Passenger',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      {/* Page explanation */}
      <div className="bg-surface border border-neutral-300 p-3 rounded-card text-xs text-muted flex items-center justify-between">
        <span>⚙️ <strong>Profile & Settings:</strong> Manage your travel requirements, language, conductor assistance notes, and accessibility display options.</span>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Passenger Profile */}
        <section className="card p-6 bg-white space-y-4" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="text-xl font-bold text-ink flex items-center gap-2">
            <UserIcon size={20} className="text-cobalt" />
            <span>Passenger Profile</span>
          </h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="p-name" className="block text-xs font-bold uppercase text-muted">
                Your Full Name (shown to Conductor)
              </label>
              <input
                id="p-name"
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="input font-bold"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="p-emergency" className="block text-xs font-bold uppercase text-muted">
                Emergency Contact Phone Number
              </label>
              <input
                id="p-emergency"
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="input font-mono tabular"
              />
            </div>
          </div>
        </section>

        {/* 2. Language Preference */}
        <section className="card p-6 bg-white space-y-3" aria-labelledby="lang-heading">
          <h2 id="lang-heading" className="text-xl font-bold text-ink">
            Language Preference
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setProfile({ language: 'en' })}
              className={`min-h-[50px] p-3 rounded-btn font-bold text-base border-2 transition-colors ${
                profile.language === 'en'
                  ? 'border-cobalt bg-blue-50 text-cobalt'
                  : 'border-neutral-300 bg-white text-ink'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setProfile({ language: 'hi' })}
              className={`min-h-[50px] p-3 rounded-btn font-bold text-base border-2 transition-colors ${
                profile.language === 'hi'
                  ? 'border-cobalt bg-blue-50 text-cobalt'
                  : 'border-neutral-300 bg-white text-ink'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </section>

        {/* 3. Accessibility Needs */}
        <section className="card p-6 bg-white space-y-4" aria-labelledby="needs-heading">
          <h2 id="needs-heading" className="text-xl font-bold text-ink">
            Accessibility Modes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Blind Mode */}
            <button
              type="button"
              onClick={() => handleNeedClick('blind')}
              className={`p-4 rounded-card border-2 text-left transition-colors relative ${
                profile.needs.includes('blind')
                  ? 'border-cobalt bg-blue-50 text-ink'
                  : 'border-neutral-300 bg-white text-ink'
              }`}
              aria-pressed={profile.needs.includes('blind')}
            >
              {profile.needs.includes('blind') && (
                <span className="absolute top-3 right-3 text-cobalt font-bold">✓ Active</span>
              )}
              <BlindIcon size={28} className="text-cobalt mb-2" />
              <div className="font-bold text-base">Blind / Low Vision</div>
              <p className="text-xs text-muted mt-1">Screen auto-read & double-tap to speak.</p>
            </button>

            {/* Deaf Mode */}
            <button
              type="button"
              onClick={() => handleNeedClick('deaf')}
              className={`p-4 rounded-card border-2 text-left transition-colors relative ${
                profile.needs.includes('deaf')
                  ? 'border-cobalt bg-blue-50 text-ink'
                  : 'border-neutral-300 bg-white text-ink'
              }`}
              aria-pressed={profile.needs.includes('deaf')}
            >
              {profile.needs.includes('deaf') && (
                <span className="absolute top-3 right-3 text-cobalt font-bold">✓ Active</span>
              )}
              <DeafIcon size={28} className="text-cobalt mb-2" />
              <div className="font-bold text-base">Deaf / Hearing</div>
              <p className="text-xs text-muted mt-1">Screen flashes, vibration, & phrase cards.</p>
            </button>

            {/* Wheelchair Mode */}
            <button
              type="button"
              onClick={() => handleNeedClick('wheelchair')}
              className={`p-4 rounded-card border-2 text-left transition-colors relative ${
                profile.needs.includes('wheelchair')
                  ? 'border-cobalt bg-blue-50 text-ink'
                  : 'border-neutral-300 bg-white text-ink'
              }`}
              aria-pressed={profile.needs.includes('wheelchair')}
            >
              {profile.needs.includes('wheelchair') && (
                <span className="absolute top-3 right-3 text-cobalt font-bold">✓ Active</span>
              )}
              <WheelchairIcon size={28} className="text-cobalt mb-2" />
              <div className="font-bold text-base">Wheelchair</div>
              <p className="text-xs text-muted mt-1">Guaranteed ramp buses & free bay tracking.</p>
            </button>
          </div>
        </section>

        {/* 4. Conductor Instructions */}
        <section className="card p-6 bg-white space-y-4" aria-labelledby="instructions-heading">
          <h2 id="instructions-heading" className="text-xl font-bold text-ink">
            Instructions Sent to Driver & Conductor
          </h2>
          <div className="flex flex-wrap gap-2">
            {presetHelps.map((chip) => {
              const selected = profile.howToHelp.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    vibrateDevice(40);
                    toggleHowToHelp(chip);
                  }}
                  className={`px-3 py-2 rounded-btn text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    selected
                      ? 'bg-cobalt text-white border-cobalt'
                      : 'bg-surface text-ink border-neutral-300 hover:bg-neutral-200'
                  }`}
                  aria-pressed={selected}
                >
                  {selected && <CheckIcon size={14} />}
                  <span>{chip}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5. Display & Theme Controls */}
        <section className="card p-6 bg-white space-y-5" aria-labelledby="display-heading">
          <h2 id="display-heading" className="text-xl font-bold text-ink">
            Display & Visual Controls
          </h2>

          {/* Theme options */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase text-muted">Theme Selection</span>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-btn border-2 font-bold text-sm flex items-center justify-center gap-2 ${
                  theme === 'light' ? 'border-cobalt bg-blue-50 text-cobalt' : 'border-neutral-300'
                }`}
              >
                <SunIcon size={18} />
                <span>Light (Default)</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-btn border-2 font-bold text-sm flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'border-cobalt bg-blue-50 text-cobalt' : 'border-neutral-300'
                }`}
              >
                <MoonIcon size={18} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('hc')}
                className={`p-3 rounded-btn border-2 font-bold text-sm flex items-center justify-center gap-2 ${
                  theme === 'hc' ? 'border-cobalt bg-blue-50 text-cobalt' : 'border-neutral-300'
                }`}
              >
                <ContrastIcon size={18} />
                <span>High Contrast</span>
              </button>
            </div>
          </div>

          {/* Text scale slider 100% to 200% */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase text-muted">
              <span>Text Scale Size</span>
              <span className="font-mono text-cobalt">{textScale}%</span>
            </div>
            <input
              type="range"
              min="100"
              max="200"
              step="10"
              value={textScale}
              onChange={(e) => setTextScale(Number(e.target.value))}
              className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-cobalt"
              aria-label="Adjust text scaling from 100 percent to 200 percent"
            />
            <div className="flex justify-between text-[11px] text-muted font-mono">
              <span>100% (Standard)</span>
              <span>150%</span>
              <span>200% (Large)</span>
            </div>
          </div>

          {/* Voice Speech Speed */}
          <div className="space-y-2 pt-2 border-t border-neutral-200">
            <div className="flex justify-between items-center text-xs font-bold uppercase text-muted">
              <span>Voice Speech Rate</span>
              <span className="font-mono text-cobalt tabular">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(Number(e.target.value))}
              className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-cobalt"
              aria-label="Adjust voice playback rate"
            />
          </div>

          {/* Toggles: Reduce motion, Lite mode, GPS Consent, Vibration */}
          <div className="space-y-3 pt-2 border-t border-neutral-200 text-sm">
            <label className="flex items-center justify-between p-2 rounded hover:bg-surface cursor-pointer">
              <div>
                <div className="font-bold text-ink">Reduce Motion</div>
                <div className="text-xs text-muted">Disables marquee animations and gliding bus graphics.</div>
              </div>
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                className="w-5 h-5 accent-cobalt cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded hover:bg-surface cursor-pointer">
              <div>
                <div className="font-bold text-ink">Lite Mode (Low Bandwidth)</div>
                <div className="text-xs text-muted">Disables satellite tile rendering to save mobile battery and data.</div>
              </div>
              <input
                type="checkbox"
                checked={liteMode}
                onChange={(e) => setLiteMode(e.target.checked)}
                className="w-5 h-5 accent-cobalt cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded hover:bg-surface cursor-pointer">
              <div>
                <div className="font-bold text-ink">Haptic Vibration Alerts</div>
                <div className="text-xs text-muted">Vibrate device on double-tap, booking confirmation, and bus arrival.</div>
              </div>
              <input
                type="checkbox"
                checked={vibrationEnabled}
                onChange={(e) => setVibrationEnabled(e.target.checked)}
                className="w-5 h-5 accent-cobalt cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded hover:bg-surface cursor-pointer">
              <div>
                <div className="font-bold text-ink">GPS Location Transmission Consent</div>
                <div className="text-xs text-muted">Allow transmitting coordinates during Emergency SOS activation.</div>
              </div>
              <input
                type="checkbox"
                checked={consentLocation}
                onChange={(e) => setConsentLocation(e.target.checked)}
                className="w-5 h-5 accent-cobalt cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* Save CTA */}
        <div className="pt-2">
          <Button type="submit" size="lg" variant="primary" fullWidth className="text-lg font-black min-h-[56px]">
            Save All Preferences
          </Button>

          {savedSuccess && (
            <p role="status" className="text-center text-sm font-bold text-success mt-2">
              ✓ Preferences updated successfully.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
