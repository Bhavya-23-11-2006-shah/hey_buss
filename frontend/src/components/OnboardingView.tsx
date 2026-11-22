import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { Need } from '../types';
import { BlindIcon, DeafIcon, WheelchairIcon, CheckIcon } from './Icons';
import { speakText, vibrateDevice } from '../utils/speech';

const PRESET_HELPS = [
  'I need the ramp',
  'Please speak facing me',
  'Please wait for me to sit down',
  'Audio announce my stop',
  'Guide me to the wheelchair bay',
];

export const OnboardingView: React.FC = () => {
  const profile = useStore((state) => state.profile);
  const setProfile = useStore((state) => state.setProfile);
  const toggleNeed = useStore((state) => state.toggleNeed);
  const toggleHowToHelp = useStore((state) => state.toggleHowToHelp);
  const completeOnboarding = useStore((state) => state.completeOnboarding);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  const [customHelp, setCustomHelp] = useState('');
  const [passengerName, setPassengerName] = useState(profile.name || 'Passenger');

  const handleNeedToggle = (need: Need) => {
    vibrateDevice(50);
    toggleNeed(need);

    // Provide immediate auditory feedback for blind mode onboarding
    if (need === 'blind' && !profile.needs.includes('blind')) {
      speakText('Blind mode enabled. Screen reader and double tap to talk activated.', profile.language);
    }
  };

  const handleAddCustomHelp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHelp.trim()) return;
    const current = profile.howToHelp;
    if (!current.includes(customHelp.trim())) {
      setProfile({ howToHelp: [...current, customHelp.trim()] });
    }
    setCustomHelp('');
  };

  const handleSave = () => {
    vibrateDevice(100);
    setProfile({ name: passengerName.trim() || 'Passenger' });
    completeOnboarding();

    const welcomeMsg =
      profile.language === 'hi'
        ? 'नमस्ते, मैं हे बस हूँ। आप कहाँ जाना चाहते हैं?'
        : "Hi, I'm Hey Buss. Where would you like to go?";
    setDestinationBoardText(welcomeMsg);

    if (profile.needs.includes('blind')) {
      speakText(welcomeMsg, profile.language);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-black text-ink mb-1">
          Accessibility Profile
        </h1>
        <p className="text-neutral-700">
          Tell us how you travel. The bus driver and conductor will be prepared with these instructions before every trip.
        </p>
      </div>

      {/* Language Selection */}
      <section className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm space-y-3">
        <label className="block text-base font-bold text-ink uppercase tracking-wider">
          1. Preferred Language
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setProfile({ language: 'en' })}
            className={`min-h-[50px] font-bold text-lg border-2 border-ink rounded transition-all ${
              profile.language === 'en'
                ? 'bg-signal-yellow text-ink shadow-hard-sm font-black'
                : 'bg-paper text-neutral-800'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setProfile({ language: 'hi' })}
            className={`min-h-[50px] font-bold text-lg border-2 border-ink rounded transition-all ${
              profile.language === 'hi'
                ? 'bg-signal-yellow text-ink shadow-hard-sm font-black'
                : 'bg-paper text-neutral-800'
            }`}
          >
            हिंदी (Hindi)
          </button>
        </div>
      </section>

      {/* Accessibility Needs Multi-Select */}
      <section className="space-y-3">
        <label className="block text-base font-bold text-ink uppercase tracking-wider">
          2. Select Your Travel Needs
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Blind Card */}
          <button
            type="button"
            onClick={() => handleNeedToggle('blind')}
            className={`p-4 border-3 border-ink rounded text-left transition-all relative ${
              profile.needs.includes('blind')
                ? 'bg-signal-yellow text-ink shadow-hard font-bold'
                : 'bg-white text-ink shadow-hard-sm'
            }`}
            aria-pressed={profile.needs.includes('blind')}
          >
            {profile.needs.includes('blind') && (
              <span className="absolute top-3 right-3 bg-ink text-white rounded-full p-1">
                <CheckIcon size={16} />
              </span>
            )}
            <div className="mb-2">
              <BlindIcon size={32} />
            </div>
            <h3 className="text-xl font-black">Blind / Vision</h3>
            <p className="text-sm mt-1 text-neutral-800">
              Auto-speaks screen updates. Double-tap anywhere on the screen to talk.
            </p>
          </button>

          {/* Deaf Card */}
          <button
            type="button"
            onClick={() => handleNeedToggle('deaf')}
            className={`p-4 border-3 border-ink rounded text-left transition-all relative ${
              profile.needs.includes('deaf')
                ? 'bg-signal-yellow text-ink shadow-hard font-bold'
                : 'bg-white text-ink shadow-hard-sm'
            }`}
            aria-pressed={profile.needs.includes('deaf')}
          >
            {profile.needs.includes('deaf') && (
              <span className="absolute top-3 right-3 bg-ink text-white rounded-full p-1">
                <CheckIcon size={16} />
              </span>
            )}
            <div className="mb-2">
              <DeafIcon size={32} />
            </div>
            <h3 className="text-xl font-black">Deaf / Hearing</h3>
            <p className="text-sm mt-1 text-neutral-800">
              Captions always visible. Vibration alerts and tap-to-speak conductor cards.
            </p>
          </button>

          {/* Wheelchair Card */}
          <button
            type="button"
            onClick={() => handleNeedToggle('wheelchair')}
            className={`p-4 border-3 border-ink rounded text-left transition-all relative ${
              profile.needs.includes('wheelchair')
                ? 'bg-signal-yellow text-ink shadow-hard font-bold'
                : 'bg-white text-ink shadow-hard-sm'
            }`}
            aria-pressed={profile.needs.includes('wheelchair')}
          >
            {profile.needs.includes('wheelchair') && (
              <span className="absolute top-3 right-3 bg-ink text-white rounded-full p-1">
                <CheckIcon size={16} />
              </span>
            )}
            <div className="mb-2">
              <WheelchairIcon size={32} />
            </div>
            <h3 className="text-xl font-black">Wheelchair</h3>
            <p className="text-sm mt-1 text-neutral-800">
              Only shows ramp-fitted buses. Displays live available wheelchair bays.
            </p>
          </button>
        </div>
      </section>

      {/* How can the conductor help you? */}
      <section className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm space-y-4">
        <div>
          <label className="block text-base font-bold text-ink uppercase tracking-wider mb-1">
            3. How can the conductor help you?
          </label>
          <p className="text-sm text-neutral-600">
            Select preset instructions sent directly to the bus driver's terminal:
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-2">
          {PRESET_HELPS.map((chip) => {
            const isSelected = profile.howToHelp.includes(chip);
            return (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  vibrateDevice(40);
                  toggleHowToHelp(chip);
                }}
                className={`min-h-[44px] px-3 py-2 border-2 border-ink rounded text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-signal-yellow text-ink shadow-hard-sm'
                    : 'bg-paper text-ink hover:bg-neutral-200'
                }`}
                aria-pressed={isSelected}
              >
                {isSelected && <CheckIcon size={14} />}
                <span>{chip}</span>
              </button>
            );
          })}
        </div>

        {/* Custom text box */}
        <form onSubmit={handleAddCustomHelp} className="flex gap-2 pt-2">
          <input
            type="text"
            value={customHelp}
            onChange={(e) => setCustomHelp(e.target.value)}
            placeholder="Add custom note (e.g. guide dog with me)"
            className="flex-1 min-h-[48px] px-3 border-2 border-ink rounded text-base font-medium bg-paper focus:bg-white focus:outline-none"
            aria-label="Add custom assistance note for conductor"
          />
          <button
            type="submit"
            className="min-h-[48px] px-4 bg-ink text-white font-bold rounded border-2 border-ink shadow-hard-sm hover:bg-neutral-800"
          >
            Add
          </button>
        </form>

        {/* Active notes summary */}
        {profile.howToHelp.length > 0 && (
          <div className="pt-2 border-t border-neutral-300">
            <span className="text-xs font-mono uppercase text-neutral-600 font-bold block mb-1">
              Currently Selected Instructions:
            </span>
            <ul className="list-disc list-inside text-sm font-semibold space-y-0.5 text-ink">
              {profile.howToHelp.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Passenger Name */}
      <section className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm space-y-2">
        <label htmlFor="passenger-name" className="block text-base font-bold text-ink uppercase tracking-wider">
          4. Passenger Name (for ticket & assistance)
        </label>
        <input
          id="passenger-name"
          type="text"
          value={passengerName}
          onChange={(e) => setPassengerName(e.target.value)}
          placeholder="Your name"
          className="w-full min-h-[48px] px-3 border-2 border-ink rounded text-base font-medium bg-paper focus:bg-white focus:outline-none"
        />
      </section>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full min-h-[56px] h-14 bg-signal-yellow text-ink border-3 border-ink rounded font-black text-xl shadow-hard hover:bg-yellow-300 active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink transition-all"
      >
        {profile.language === 'hi' ? 'सेव करें और जारी रखें' : 'Save Profile & Continue'}
      </button>
    </div>
  );
};
