import React, { useRef, useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../Header';
import { DestinationBoard } from '../DestinationBoard';
import { SosButton } from '../SosButton';
import { DisplaySettingsBar } from '../ui/DisplaySettingsBar';
import { UndoToast } from '../UndoToast';
import {
  HomeIcon,
  BookIcon,
  MapIcon,
  TicketIcon,
  HelpIcon,
  UserIcon,
  SettingsIcon,
  MicIcon,
} from '../Icons';
import { useStore } from '../../store/useStore';
import { apiClient } from '../../api/client';
import {
  speakText,
  vibrateDevice,
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
} from '../../utils/speech';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useStore((state) => state.profile);
  const sessionId = useStore((state) => state.sessionId);
  const setActiveBooking = useStore((state) => state.setActiveBooking);
  const setBookingTimestamp = useStore((state) => state.setBookingTimestamp);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);
  const isScreenFlashing = useStore((state) => state.isScreenFlashing);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Blind mode: double tap anywhere to talk
  const lastTapRef = useRef<number>(0);

  const handleGlobalTouch = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!profile.needs.includes('blind')) return;
    const now = event.timeStamp;
    const timespan = now - lastTapRef.current;
    if (timespan < 350 && timespan > 50) {
      vibrateDevice([120, 60, 120]);
      if (isListening) {
        stopVoice();
      } else {
        startVoice();
      }
    }
    lastTapRef.current = now;
  };

  // Announce page change to screen reader & TTS in Blind mode
  useEffect(() => {
    if (profile.needs.includes('blind')) {
      const pageNames: Record<string, string> = {
        '/': 'Landing screen. A bus that is ready for you.',
        '/app': 'Home screen. Quick booking and assistance.',
        '/app/book': 'Book a bus. Three step accessible booking.',
        '/app/track': 'Live bus tracking and stop timeline.',
        '/app/tickets': 'My tickets screen. Boarding passes and trip history.',
        '/app/help': 'Help screen. Voice cheat sheet and emergency details.',
        '/app/profile': 'Assistance profile settings.',
        '/app/settings': 'App display and accessibility settings.',
      };
      const text = pageNames[location.pathname] || 'Screen loaded';
      speakText(text, profile.language);
    }
  }, [location.pathname, profile]);

  // Voice handler
  const processVoiceTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    setDestinationBoardText(`LISTENING: "${transcript}"`);

    let clean = transcript.toLowerCase();
    const wakePhrases = ['hey buss', 'hey bus', 'hey boss', 'a bus', 'hey bas'];
    for (const wp of wakePhrases) {
      if (clean.startsWith(wp)) {
        clean = clean.replace(wp, '').trim();
      }
    }

    try {
      const response = await apiClient.sendVoiceIntent(clean || transcript, sessionId, profile);
      setDestinationBoardText(response.spokenReply);
      speakText(response.spokenReply, profile.language);

      if ((response.uiAction.type === 'SHOW_TRIPS' || response.uiAction.type === 'ASK_CONFIRM') && response.uiAction.trips) {
        navigate('/app/book', { state: { voiceResponse: response } });
      } else if (response.uiAction.type === 'BOOKED' && response.uiAction.booking) {
        setActiveBooking(response.uiAction.booking);
        setBookingTimestamp(Date.now());
        navigate('/app/tickets');
      } else if (response.uiAction.type === 'SHOW_TRACKING') {
        navigate('/app/track');
      } else if (response.uiAction.type === 'SOS') {
        try {
          const booking = useStore.getState().activeBooking;
          const result = await apiClient.sendSos(booking?.id, null, null, profile);
          const message = result.mocked
            ? 'Demo SOS only: no staff or emergency service was contacted.'
            : 'SOS alert posted to the Hey Buss server. Emergency services were not contacted.';
          setDestinationBoardText(message);
          speakText(message, profile.language);
        } catch {
          const message = 'Hey Buss could not confirm the SOS alert. Contact emergency services directly.';
          setDestinationBoardText(message);
          speakText(message, profile.language);
        }
      }
    } catch (err) {
      console.warn('Voice processing error:', err);
      const errMsg = 'Sorry, could not process voice request. Please try again.';
      setDestinationBoardText(errMsg);
      speakText(errMsg, profile.language);
    } finally {
      setIsListening(false);
    }
  };

  const startVoice = () => {
    vibrateDevice(80);
    if (!isSpeechRecognitionSupported()) {
      setDestinationBoardText('Speech recognition not supported in this browser. Please use keyboard or buttons.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const rec = createSpeechRecognizer(
        profile.language,
        (transcript) => {
          processVoiceTranscript(transcript);
        },
        () => {
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (rec) {
        recognitionRef.current = rec;
        rec.start();
        setIsListening(true);
        const listeningMsg = profile.language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...';
        setDestinationBoardText(listeningMsg);
      }
    } catch {
      setIsListening(false);
    }
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  };

  const navItems = [
    { to: '/app', label: 'Home', icon: HomeIcon, end: true },
    { to: '/app/book', label: 'Book', icon: BookIcon },
    { to: '/app/track', label: 'Track', icon: MapIcon },
    { to: '/app/tickets', label: 'Tickets', icon: TicketIcon },
    { to: '/app/help', label: 'Help', icon: HelpIcon },
  ];

  const desktopExtraItems = [
    { to: '/app/profile', label: 'Profile', icon: UserIcon },
    { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div
      onTouchStart={handleGlobalTouch}
      className={`min-h-screen bg-white text-ink flex flex-col font-sans transition-colors duration-200 ${
        isScreenFlashing ? 'flash-alert' : ''
      }`}
    >
      {/* Skip to Content link on every page */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Screen Reader Live Region for status notifications */}
      <div aria-live="assertive" className="sr-only" role="status" />

      {/* Header with Wordmark, Talk button, Language, Settings */}
      <Header
        onTalkClick={isListening ? stopVoice : startVoice}
        isListening={isListening}
      />

      {/* Slim Signature Dark Destination Board Strip */}
      <DestinationBoard />

      {/* Accessibility Display Settings Bar (A-, A+, theme, motion, read aloud) */}
      <DisplaySettingsBar />

      {/* Main Container with Desktop Sidebar + Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar (visible on md: and above) */}
        <aside
          aria-label="Desktop navigation sidebar"
          className="hidden md:flex flex-col w-64 p-4 border-r border-neutral-300 bg-surface flex-shrink-0 space-y-6"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted px-3">
              Main Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-btn font-bold text-base transition-colors ${
                      isActive
                        ? 'bg-cobalt text-white shadow-sm'
                        : 'text-ink hover:bg-neutral-200'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <div className="pt-4 border-t border-neutral-300 space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted px-3">
              Preferences
            </span>
            {desktopExtraItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-btn font-bold text-base transition-colors ${
                      isActive
                        ? 'bg-cobalt text-white shadow-sm'
                        : 'text-ink hover:bg-neutral-200'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Sidebar Passenger Card */}
          <div className="mt-auto p-3.5 bg-white border border-neutral-300 rounded-card space-y-1 text-xs">
            <div className="font-bold text-ink">
              {profile.name || 'Passenger'}
            </div>
            <div className="text-muted truncate">
              {profile.needs.length > 0 ? profile.needs.join(', ') : 'Standard transit'}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 mb-nav md:mb-0 focus:outline-none"
        >
          <Outlet />
        </main>
      </div>

      {/* Floating Emergency SOS Button on every page */}
      <SosButton floating={true} />

      {/* 30-Second Booking Undo Toast */}
      <UndoToast />

      {/* Mobile Fixed Bottom Tab Bar (under 768px) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-300 pb-safe shadow-lg"
      >
        <div className="flex items-center justify-around px-2 py-1.5 relative">
          {/* Home */}
          <NavLink
            to="/app"
            end
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            aria-label="Home"
          >
            <HomeIcon size={20} />
            <span>Home</span>
          </NavLink>

          {/* Book */}
          <NavLink
            to="/app/book"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            aria-label="Book Bus"
          >
            <BookIcon size={20} />
            <span>Book</span>
          </NavLink>

          {/* Center Raised Marigold Talk Button */}
          <button
            type="button"
            onClick={isListening ? stopVoice : startVoice}
            className={`-mt-6 w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 border-white shadow-md text-ink transition-all active:scale-90 ${
              isListening
                ? 'bg-danger text-white animate-pulse'
                : 'bg-marigold hover:brightness-105'
            }`}
            style={{ backgroundColor: isListening ? '#E5213B' : '#FFB800' }}
            aria-label={isListening ? 'Stop listening' : 'Talk to Hey Buss'}
          >
            <MicIcon size={24} />
            <span className="text-[10px] font-black uppercase tracking-tight">Talk</span>
          </button>

          {/* Track */}
          <NavLink
            to="/app/track"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            aria-label="Track Bus"
          >
            <MapIcon size={20} />
            <span>Track</span>
          </NavLink>

          {/* Tickets */}
          <NavLink
            to="/app/tickets"
            className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
            aria-label="My Tickets"
          >
            <TicketIcon size={20} />
            <span>Tickets</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
