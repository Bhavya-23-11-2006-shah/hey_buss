import React from 'react';
import { useStore } from '../store/useStore';
import { BlindIcon, DeafIcon, WheelchairIcon, BusIcon } from './Icons';

export const LandingView: React.FC = () => {
  const setScreen = useStore((state) => state.setScreen);
  const isOnboarded = useStore((state) => state.isOnboarded);
  const profile = useStore((state) => state.profile);

  const handleStart = () => {
    if (isOnboarded) {
      setScreen('home');
    } else {
      setScreen('onboarding');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 pt-4">
        <div className="inline-block px-3 py-1 bg-signal-yellow border-2 border-ink rounded font-extrabold text-sm uppercase tracking-wider shadow-hard-sm">
          Accessible Public Transit
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-ink leading-tight">
          A bus that is ready for you.
        </h1>
        <p className="text-xl max-w-xl mx-auto text-neutral-800 font-medium">
          Voice-first government bus booking built with and for disabled passengers.
          No confusing apps, no rushing. The conductor is notified before you arrive.
        </p>
      </section>

      {/* Bus gliding along a route line (CSS/SVG) */}
      <section
        aria-label="Bus route visualization"
        className="w-full bg-white border-3 border-ink rounded p-4 shadow-hard overflow-hidden"
      >
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 mb-2 flex justify-between">
          <span>Route Line 102</span>
          <span>Low-Floor Accessible</span>
        </div>

        <div className="relative py-4">
          {/* Track line */}
          <div className="h-2 bg-ink w-full rounded-full relative">
            <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-4 h-4 rounded-full bg-signal-yellow border-2 border-ink" />
            <div className="absolute top-1/2 left-[50%] -translate-y-1/2 w-4 h-4 rounded-full bg-signal-yellow border-2 border-ink" />
            <div className="absolute top-1/2 left-[90%] -translate-y-1/2 w-4 h-4 rounded-full bg-signal-yellow border-2 border-ink" />
          </div>

          {/* Gliding Bus */}
          <div className="animate-bus-glide w-12 h-12 flex items-center justify-center -mt-7">
            <div className="bg-signal-yellow border-2 border-ink p-1.5 rounded shadow-hard-sm text-ink">
              <BusIcon size={24} />
            </div>
          </div>

          <div className="flex justify-between text-xs font-mono font-bold mt-2 text-ink">
            <span>Central Station</span>
            <span>Gandhi Park</span>
            <span>Civil Hospital</span>
          </div>
        </div>
      </section>

      {/* 4-Step "How it works" */}
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-ink">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm space-y-2">
            <div className="w-8 h-8 rounded-full bg-signal-yellow border-2 border-ink flex items-center justify-center font-black text-sm">
              1
            </div>
            <h3 className="text-lg font-bold">Say it</h3>
            <p className="text-neutral-700 text-base">
              Tap the giant Talk button or say where you want to go. No complex typing or menus.
            </p>
          </div>

          <div className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm space-y-2">
            <div className="w-8 h-8 rounded-full bg-signal-yellow border-2 border-ink flex items-center justify-center font-black text-sm">
              2
            </div>
            <h3 className="text-lg font-bold">Pick a bus</h3>
            <p className="text-neutral-700 text-base">
              We find upcoming buses with automated wheelchair ramps and free wheelchair bays.
            </p>
          </div>

          <div className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm space-y-2">
            <div className="w-8 h-8 rounded-full bg-signal-yellow border-2 border-ink flex items-center justify-center font-black text-sm">
              3
            </div>
            <h3 className="text-lg font-bold">Get a ticket</h3>
            <p className="text-neutral-700 text-base">
              A high-contrast digital boarding pass confirms your seat with 30-second undo safety.
            </p>
          </div>

          <div className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm space-y-2">
            <div className="w-8 h-8 rounded-full bg-signal-yellow border-2 border-ink flex items-center justify-center font-black text-sm">
              4
            </div>
            <h3 className="text-lg font-bold">A person is ready for you</h3>
            <p className="text-neutral-700 text-base">
              The conductor is notified in advance to lower the ramp and assist you at the stop.
            </p>
          </div>
        </div>
      </section>

      {/* Row of 3 Mode Pictograms */}
      <section className="space-y-4">
        <h2 className="text-2xl font-serif font-bold text-ink">
          Accessible your way
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-paper border-2 border-ink rounded-full">
              <BlindIcon size={28} />
            </div>
            <h3 className="font-bold text-lg">Blind Mode</h3>
            <p className="text-sm text-neutral-700">
              Auto-speaks every screen and lets you double-tap anywhere to speak.
            </p>
          </div>

          <div className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-paper border-2 border-ink rounded-full">
              <DeafIcon size={28} />
            </div>
            <h3 className="font-bold text-lg">Deaf Mode</h3>
            <p className="text-sm text-neutral-700">
              Always-on captions, alert vibration, screen flashes, and phrase cards.
            </p>
          </div>

          <div className="bg-white border-2 border-ink p-4 rounded shadow-hard-sm flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-paper border-2 border-ink rounded-full">
              <WheelchairIcon size={28} />
            </div>
            <h3 className="font-bold text-lg">Wheelchair Mode</h3>
            <p className="text-sm text-neutral-700">
              Guarantees ramp-fitted low-floor buses and tracks open wheelchair bays.
            </p>
          </div>
        </div>
      </section>

      {/* Start Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleStart}
          className="w-full min-h-[56px] h-14 bg-signal-yellow text-ink border-3 border-ink rounded font-black text-xl shadow-hard hover:bg-yellow-300 active:translate-x-1 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink transition-all"
        >
          {profile.language === 'hi' ? 'यात्रा शुरू करें' : 'Start Your Journey'}
        </button>
      </div>
    </div>
  );
};
