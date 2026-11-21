import React, { useRef, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Header } from './components/Header';
import { DestinationBoard } from './components/DestinationBoard';
import { LandingView } from './components/LandingView';
import { OnboardingView } from './components/OnboardingView';
import { HomeView } from './components/HomeView';
import { TicketView } from './components/TicketView';
import { UndoToast } from './components/UndoToast';
import { speakText, vibrateDevice } from './utils/speech';

export const App: React.FC = () => {
  const currentScreen = useStore((state) => state.currentScreen);
  const profile = useStore((state) => state.profile);
  const isScreenFlashing = useStore((state) => state.isScreenFlashing);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  // Blind mode: Double-tap anywhere to talk
  const lastTapRef = useRef<number>(0);

  const handleGlobalTouch = () => {
    if (!profile.needs.includes('blind')) return;

    const now = Date.now();
    const timespan = now - lastTapRef.current;
    if (timespan < 350 && timespan > 50) {
      // Double tap detected!
      vibrateDevice([120, 60, 120]);
      const prompt =
        profile.language === 'hi'
          ? 'बोलिए, आप कहाँ जाना चाहते हैं?'
          : "Listening. Where would you like to go?";
      setDestinationBoardText(prompt);
      speakText(prompt, profile.language);
    }
    lastTapRef.current = now;
  };

  // Announce screen navigation in Blind mode
  useEffect(() => {
    if (profile.needs.includes('blind')) {
      let screenName = 'Home screen';
      if (currentScreen === 'landing') screenName = 'Hey Buss landing screen';
      else if (currentScreen === 'onboarding') screenName = 'Accessibility settings screen';
      else if (currentScreen === 'ticket') screenName = 'Your bus boarding ticket and live tracking screen';

      speakText(screenName, profile.language);
    }
  }, [currentScreen, profile]);

  return (
    <div
      onTouchStart={handleGlobalTouch}
      className={`min-h-screen bg-paper text-ink flex flex-col font-sans transition-colors duration-200 ${
        isScreenFlashing ? 'flash-alert' : ''
      }`}
    >
      {/* Screen reader live region for global accessibility */}
      <div aria-live="assertive" className="sr-only" role="status" />

      {/* Global Header */}
      <Header />

      {/* Signature Dot-Matrix Destination Board Strip */}
      <DestinationBoard />

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 focus:outline-none"
      >
        {currentScreen === 'landing' && <LandingView />}
        {currentScreen === 'onboarding' && <OnboardingView />}
        {currentScreen === 'home' && <HomeView />}
        {currentScreen === 'ticket' && <TicketView />}
      </main>

      {/* 30-Second Undo Toast */}
      <UndoToast />

      {/* Footer info */}
      <footer className="border-t-2 border-neutral-300 py-4 text-center text-xs text-neutral-600 font-mono">
        <p>Hey Buss • Accessible Government Transit • WCAG AAA</p>
      </footer>
    </div>
  );
};

export default App;
