import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import { Button } from '../components/ui/Button';
import { StatTile } from '../components/ui/StatTile';
import { RouteBadge } from '../components/ui/RouteBadge';
import { StatusPill } from '../components/ui/StatusPill';
import {
  MicIcon,
  LocationIcon,
} from '../components/Icons';
import {
  speakText,
  vibrateDevice,
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
} from '../utils/speech';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const profile = useStore((state) => state.profile);
  const sessionId = useStore((state) => state.sessionId);
  const activeBooking = useStore((state) => state.activeBooking);
  const setActiveBooking = useStore((state) => state.setActiveBooking);
  const setBookingTimestamp = useStore((state) => state.setBookingTimestamp);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);
  const activeRoute = activeBooking?.tripId.startsWith('HB-9') ? 'A4' : 'S12';

  const [isListening, setIsListening] = useState(false);
  const [listeningTranscript, setListeningTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognizer>>(null);

  // Quick destinations (real Kolkata copy)
  const quickDestinations = [
    { name: 'Salt Lake Sector V', note: 'IT Hub • Wide curb and boarding lane', time: '18 min' },
    { name: 'Airport Gate 3', note: 'Terminal bus stand • Staff assistance point', time: '35 min' },
  ];

  // 4-phrase voice cheat sheet
  const voiceCheatSheet = [
    '“Hey Buss, book the next bus from Esplanade to Salt Lake Sector V”',
    '“Where is my bus?”',
    '“Take the next one”',
    '“Emergency SOS”',
  ];

  // Voice handler
  const handleTalk = () => {
    vibrateDevice(80);
    if (!isSpeechRecognitionSupported()) {
      setVoiceError('Voice recognition is unavailable in this browser. Use “Book a Bus” to select stops manually.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    setVoiceError(null);
    const rec = createSpeechRecognizer(
      profile.language,
      async (transcript) => {
        setVoiceError(null);
        setListeningTranscript(transcript);
        setDestinationBoardText(`LISTENING: "${transcript}"`);

        try {
          const res = await apiClient.sendVoiceIntent(transcript, sessionId, profile);
          setDestinationBoardText(res.spokenReply);
          speakText(res.spokenReply, profile.language);

          if ((res.uiAction.type === 'SHOW_TRIPS' || res.uiAction.type === 'ASK_CONFIRM') && res.uiAction.trips) {
            navigate('/app/book', { state: { voiceResponse: res } });
          } else if (res.uiAction.type === 'BOOKED' && res.uiAction.booking) {
            setActiveBooking(res.uiAction.booking);
            setBookingTimestamp(Date.now());
            navigate('/app/tickets');
          } else if (res.uiAction.type === 'SOS') {
            try {
              const result = await apiClient.sendSos(activeBooking?.id, null, null, profile);
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
        } catch {
          setDestinationBoardText('Could not process voice request. Please try again.');
        } finally {
          setIsListening(false);
        }
      },
      (error) => {
        recognitionRef.current = null;
        setIsListening(false);
        setVoiceError(error === 'not-allowed'
          ? 'Microphone access is blocked. Allow microphone access in your browser, then try again.'
          : `Voice recognition stopped (${error}). Try again or use “Book a Bus”.`);
      },
      () => {
        recognitionRef.current = null;
        setIsListening(false);
      }
    );

    if (rec) {
      try {
        setVoiceError(null);
        recognitionRef.current = rec;
        rec.start();
        setIsListening(true);
        const msg = profile.language === 'hi' ? 'बोलिए, कहाँ जाना चाहते हैं?' : 'Listening. Where would you like to go?';
        setDestinationBoardText(msg);
        speakText(msg, profile.language);
      } catch {
        recognitionRef.current = null;
        setIsListening(false);
        setVoiceError('Could not start the microphone. Allow access in your browser, then try again.');
      }
    }
  };

  const handleQuickBook = (dest: string) => {
    vibrateDevice(60);
    navigate('/app/book', { state: { destination: dest } });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Explanation Banner */}
      <div className="bg-surface border border-neutral-300 p-3 rounded-card text-xs text-muted flex items-center justify-between">
        <span>👋 <strong>Home:</strong> Quick voice booking, your upcoming ride, and Kolkata accessible stops.</span>
        <button
          onClick={() => navigate('/app/book')}
          className="text-cobalt font-bold underline text-xs"
        >
          Book a Bus →
        </button>
      </div>

      {/* Greeting by name */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-4xl font-black text-ink">
          Hello, {profile.name || 'Passenger'}
        </h1>
        <p className="text-muted text-base">
          {profile.language === 'hi'
            ? 'आप आज कहाँ यात्रा करना चाहते हैं?'
            : 'Where would you like to travel today in Kolkata?'}
        </p>
      </div>

      {/* Big Talk Card */}
      <section aria-label="Voice booking" className="card p-6 sm:p-8 bg-surface border-2 border-neutral-300 text-center space-y-4">
        <div className="max-w-md mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase text-muted tracking-wider">
            Voice Assistant
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-ink">
            Tap and say your destination
          </h2>
          <p className="text-sm text-muted">
            Say a destination in English or Hindi. Available trips depend on the selected route and time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTalk}
          className={`w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-full flex flex-col items-center justify-center gap-1 border-4 border-white shadow-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cobalt ${
            isListening
              ? 'bg-danger text-white animate-pulse'
              : 'bg-marigold text-ink hover:brightness-105'
          }`}
          style={{ backgroundColor: isListening ? '#E5213B' : '#FFB800' }}
          aria-label={isListening ? 'Stop listening' : 'Start voice booking. Tap and say where you want to go'}
        >
          <MicIcon size={36} />
          <span className="text-sm font-black uppercase tracking-wider">
            {isListening ? 'Listening' : 'Talk'}
          </span>
        </button>

        {listeningTranscript && (
          <p className="text-sm font-mono text-ink bg-white p-2 rounded border border-neutral-300 max-w-sm mx-auto">
            "{listeningTranscript}"
          </p>
        )}
        {voiceError && (
          <p role="alert" className="mx-auto max-w-lg rounded-btn border border-amber-300 bg-amber-50 p-3 text-left text-sm font-semibold text-amber-950">
            {voiceError}
          </p>
        )}
      </section>

      {/* Next Ride Ticket Card with live info */}
      <section aria-label="Upcoming or active ride" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">
            {activeBooking && activeBooking.status !== 'CANCELLED' ? 'Your Active Ride' : 'Next Scheduled Accessible Service'}
          </h2>
          <RouteBadge route={activeBooking ? activeRoute : 'S12'} />
        </div>

        {activeBooking && activeBooking.status !== 'CANCELLED' ? (
          <div className="card p-5 border-2 border-cobalt shadow-md space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xl font-black text-ink">
                  {activeBooking.from} → {activeBooking.to}
                </div>
                <div className="text-xs text-muted">Route {activeRoute} • Trip {activeBooking.tripId}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-black text-ink tabular">{activeBooking.departs}</div>
                <StatusPill status={activeBooking.status} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                <span className="text-xs text-muted">Assistance details are attached to this demo booking.</span>
              <Button size="sm" variant="primary" onClick={() => navigate('/app/tickets')}>
                View Pass & Track →
              </Button>
            </div>
          </div>
        ) : (
          <div className="card p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-lg font-bold text-ink">Esplanade → Salt Lake Sector V</div>
                <div className="text-xs text-muted">Sample route • Search for current availability</div>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-bold text-ink tabular">Next: 09:00</span>
                <span className="block text-xs font-bold text-success">On Schedule</span>
              </div>
            </div>
            <Button
              size="md"
              variant="secondary"
              fullWidth
              onClick={() => handleQuickBook('Salt Lake Sector V')}
            >
              Search This Route
            </Button>
          </div>
        )}
      </section>

      {/* Quick Actions (Nearby Accessible Stops) */}
      <section aria-label="Quick accessible stops" className="space-y-3">
        <h2 className="text-lg font-bold text-ink">
          Popular Accessible Destinations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickDestinations.map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => handleQuickBook(dest.name)}
              className="card p-4 text-left hover:border-cobalt transition-colors group flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-bold text-base text-ink group-hover:text-cobalt flex items-center gap-2">
                  <LocationIcon size={18} className="text-cobalt flex-shrink-0" />
                  <span>{dest.name}</span>
                </div>
                <p className="text-xs text-muted">{dest.note}</p>
              </div>
              <span className="text-xs font-mono font-bold text-muted tabular flex-shrink-0">
                {dest.time}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Live Status Counts Strip */}
      <section aria-label="Kolkata network status" className="grid grid-cols-3 gap-3">
        <StatTile label="Sample Routes" value="2" subtext="Demo schedule" />
        <StatTile label="Stops Listed" value="8" subtext="Kolkata demo data" />
        <StatTile label="Trip Status" value="Live" subtext="From connected backend" />
      </section>

      {/* 4-Phrase Voice Cheat Sheet */}
      <section aria-label="Voice cheat sheet" className="card p-5 bg-surface space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
          Voice Commands Cheat Sheet
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {voiceCheatSheet.map((phrase, i) => (
            <div key={i} className="bg-white p-2.5 rounded-btn border border-neutral-300 font-medium text-ink flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt flex-shrink-0" />
              <span>{phrase}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
