import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import type { Trip, TripsSearchResult } from '../types';
import {
  speakText,
  vibrateDevice,
  isSpeechRecognitionSupported,
  createSpeechRecognizer,
} from '../utils/speech';
import { MicIcon, LocationIcon, CheckIcon, AlertIcon } from './Icons';
import { TripCard } from './TripCard';
import { DeafPhraseCards } from './DeafPhraseCards';

export const HomeView: React.FC = () => {
  const profile = useStore((state) => state.profile);
  const sessionId = useStore((state) => state.sessionId);
  const activeBooking = useStore((state) => state.activeBooking);
  const setActiveBooking = useStore((state) => state.setActiveBooking);
  const setBookingTimestamp = useStore((state) => state.setBookingTimestamp);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);
  const setScreen = useStore((state) => state.setScreen);

  const [isListening, setIsListening] = useState(false);
  const [listeningTranscript, setListeningTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');

  // Voice dialog results
  const [tripsResult, setTripsResult] = useState<TripsSearchResult | null>(null);
  const [pendingConfirmationTrip, setPendingConfirmationTrip] = useState<Trip | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const recognitionRef = useRef<any>(null);
  const hasIntroducedRef = useRef(false);

  // 1. Introduce assistant once per session
  useEffect(() => {
    if (!hasIntroducedRef.current) {
      hasIntroducedRef.current = true;
      const intro =
        profile.language === 'hi'
          ? 'नमस्ते, मैं हे बस हूँ। आप कहाँ जाना चाहते हैं?'
          : "Hi, I'm Hey Buss. Where would you like to go?";
      setDestinationBoardText(intro);

      if (profile.needs.includes('blind')) {
        speakText(intro, profile.language);
      }
    }
  }, [profile]);

  // 2. Handle voice input response
  const processTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;

    // Check wake phrase variations
    let clean = transcript.toLowerCase();
    const wakePhrases = ['hey buss', 'hey bus', 'hey boss', 'a bus', 'hey bas'];
    for (const wp of wakePhrases) {
      if (clean.startsWith(wp)) {
        clean = clean.replace(wp, '').trim();
      }
    }

    setIsProcessingVoice(true);
    setDestinationBoardText(`LISTENING: "${transcript}"`);

    try {
      const response = await apiClient.sendVoiceIntent(clean || transcript, sessionId, profile);

      setDestinationBoardText(response.spokenReply);
      speakText(response.spokenReply, profile.language);

      if (response.uiAction.type === 'SHOW_TRIPS' && response.uiAction.trips) {
        setTripsResult(response.uiAction.trips);
        setPendingConfirmationTrip(response.uiAction.trips.exact);

        // In Blind mode, read alternative trips aloud
        if (profile.needs.includes('blind')) {
          const trip = response.uiAction.trips.exact;
          if (trip) {
            setTimeout(() => {
              speakText(
                `Exact match: Route ${trip.route} departing at ${trip.departs}. Say confirm or tap confirm to book.`,
                profile.language
              );
            }, 3000);
          }
        }
      } else if (response.uiAction.type === 'ASK_CONFIRM') {
        if (tripsResult?.exact) {
          setPendingConfirmationTrip(tripsResult.exact);
        }
      } else if (response.uiAction.type === 'BOOKED' && response.uiAction.booking) {
        setActiveBooking(response.uiAction.booking);
        setBookingTimestamp(Date.now());
        setTripsResult(null);
        setPendingConfirmationTrip(null);
        setScreen('ticket');
      } else if (response.uiAction.type === 'SHOW_TRACKING') {
        if (activeBooking) {
          setScreen('ticket');
        }
      }
    } catch (err) {
      console.warn('Voice processing error:', err);
      const errMsg = 'Sorry, could not process voice request. Please try again.';
      setDestinationBoardText(errMsg);
      speakText(errMsg, profile.language);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Start / Stop listening
  const startListening = () => {
    vibrateDevice(80);
    setMicError(null);
    setListeningTranscript('');

    if (!isSpeechRecognitionSupported()) {
      setMicError('Speech recognition is not supported in this browser. Please use the text box below.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const rec = createSpeechRecognizer(
        profile.language,
        (transcript) => {
          setListeningTranscript(transcript);
          processTranscript(transcript);
        },
        (error) => {
          console.warn('Recognition error:', error);
          if (error === 'not-allowed') {
            setMicError('Microphone access was denied. Please allow microphone or use text below.');
          } else {
            setMicError(`Voice error: ${error}. You can also type below.`);
          }
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
      }
    } catch (err) {
      setMicError('Could not start microphone. You can type your request below.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Quick saved places handler
  const handleQuickPlace = (destination: string) => {
    vibrateDevice(60);
    const text = `Take me to ${destination}`;
    setDestinationBoardText(text);
    processTranscript(text);
  };

  // Confirm booking action
  const handleConfirmBooking = async (trip: Trip) => {
    vibrateDevice(150);
    try {
      const booking = await apiClient.createBooking(trip.id, trip.from, trip.to, profile);
      setActiveBooking(booking);
      setBookingTimestamp(Date.now());
      setTripsResult(null);
      setPendingConfirmationTrip(null);

      const successMsg =
        profile.language === 'hi'
          ? `बुकिंग पक्की हो गई! रूट ${trip.route}, समय ${trip.departs} बजे।`
          : `Booking confirmed! Route ${trip.route} at ${trip.departs}. Your boarding ticket is ready.`;

      setDestinationBoardText(successMsg);
      speakText(successMsg, profile.language);
      setScreen('ticket');
    } catch (err) {
      console.warn('Booking confirmation failed:', err);
    }
  };

  // Handle manual text submission fallback
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    const txt = manualText.trim();
    setManualText('');
    processTranscript(txt);
  };

  const isWheelchair = profile.needs.includes('wheelchair');
  const isDeaf = profile.needs.includes('deaf');

  return (
    <div className="space-y-6 pb-16">
      {/* ABOVE THE FOLD SECTION (Only Giant Talk, Saved Places, Next-ride card) */}
      <section aria-label="Quick Bus Booking" className="space-y-6 pt-2">
        {/* Giant Talk Button */}
        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`w-40 h-40 sm:w-44 sm:h-44 mx-auto rounded-full border-4 border-ink shadow-hard-lg flex flex-col items-center justify-center gap-1.5 transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-signal-yellow text-ink hover:bg-yellow-300'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Talk to Hey Buss. Tap to book with your voice'}
          >
            <div className="p-3 bg-white border-2 border-ink rounded-full text-ink shadow-hard-sm">
              <MicIcon size={36} />
            </div>
            <span className="text-xl font-black tracking-wide uppercase">
              {isListening ? 'Listening...' : 'Talk'}
            </span>
            <span className="text-xs font-mono font-bold text-neutral-800">
              {isListening ? 'Tap to finish' : 'Say "Hey Buss"'}
            </span>
          </button>

          {isListening && (
            <p role="status" aria-live="polite" className="text-base font-bold text-ink animate-pulse">
              Listening to your destination...
            </p>
          )}

          {listeningTranscript && (
            <div className="text-sm font-mono bg-white p-2 border-2 border-ink rounded max-w-sm mx-auto">
              "{listeningTranscript}"
            </div>
          )}
        </div>

        {/* Saved Places (Home, Hospital) */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 block text-center sm:text-left">
            Quick Destinations
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickPlace('Central Bus Station')}
              className="min-h-[56px] p-3 bg-white border-3 border-ink rounded font-black text-lg shadow-hard-sm hover:bg-signal-yellow active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-ink transition-all"
            >
              <LocationIcon size={20} />
              <span>Home (Central)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPlace('Civil Hospital')}
              className="min-h-[56px] p-3 bg-white border-3 border-ink rounded font-black text-lg shadow-hard-sm hover:bg-signal-yellow active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-ink transition-all"
            >
              <LocationIcon size={20} />
              <span>Hospital</span>
            </button>
          </div>
        </div>

        {/* Next-Ride Card */}
        <div className="bg-white border-3 border-ink rounded p-4 shadow-hard">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">
              {activeBooking && activeBooking.status !== 'CANCELLED'
                ? 'Active Booking'
                : 'Next Frequent Service'}
            </span>
            <span className="px-2 py-0.5 bg-signal-yellow border border-ink text-xs font-black rounded">
              Route 102
            </span>
          </div>

          {activeBooking && activeBooking.status !== 'CANCELLED' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <div className="text-xl font-bold">
                  {activeBooking.from} → {activeBooking.to}
                </div>
                <div className="text-2xl font-mono font-black">
                  {activeBooking.departs}
                </div>
              </div>
              <div className="text-sm font-semibold text-transit-green flex items-center gap-1.5">
                <CheckIcon size={16} />
                <span>Status: {activeBooking.status} (Conductor notified)</span>
              </div>
              <button
                type="button"
                onClick={() => setScreen('ticket')}
                className="w-full min-h-[50px] bg-ink text-white font-bold text-base rounded border-2 border-ink shadow-hard-sm hover:bg-neutral-800 focus-visible:ring-4 focus-visible:ring-ink"
              >
                View Ticket & Live Tracking →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <div>
                  <div className="text-lg font-bold">Central Station → Civil Hospital</div>
                  <div className="text-xs text-neutral-600">Every 15 minutes • Ramp fitted</div>
                </div>
                <div className="text-xl font-mono font-black">Next: 10:30</div>
              </div>
              <p className="text-xs text-neutral-500">
                Low-floor government bus with 2 dedicated wheelchair bays and conductor assistance.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* DYNAMIC RESULTS: TRIPS & ALTERNATIVES (Step 6 & 7) */}
      {tripsResult && (
        <section aria-label="Available Bus Trips" className="space-y-4 pt-4 border-t-2 border-ink">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-black text-ink">
              Matching Accessible Buses
            </h2>
            <button
              type="button"
              onClick={() => setTripsResult(null)}
              className="text-sm font-mono font-bold underline"
            >
              Clear
            </button>
          </div>

          {/* Exact Trip */}
          {tripsResult.exact ? (
            <div>
              <span className="text-xs font-mono font-black uppercase tracking-wider text-neutral-600 mb-1 block">
                Best Match (Exact)
              </span>
              <TripCard
                trip={tripsResult.exact}
                isExact={true}
                label="Selected"
                reason={tripsResult.reason}
                onSelect={handleConfirmBooking}
                showWheelchairProminent={isWheelchair}
              />
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border-2 border-ink rounded font-bold text-ink">
              No exact time match found. Showing earlier and later accessible alternatives:
            </div>
          )}

          {/* Step 7: Alternatives (Earlier & Later) */}
          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-serif font-bold text-ink">
              Alternative Times
            </h3>

            {tripsResult.earlier && (
              <TripCard
                trip={tripsResult.earlier}
                label="Earlier"
                diffMinutes={-15}
                reason="Departs 15 minutes earlier with automated ramp"
                onSelect={handleConfirmBooking}
                showWheelchairProminent={isWheelchair}
              />
            )}

            {tripsResult.later && (
              <TripCard
                trip={tripsResult.later}
                label="Later"
                diffMinutes={20}
                reason="Departs 20 minutes later with 3 free bays"
                onSelect={handleConfirmBooking}
                showWheelchairProminent={isWheelchair}
              />
            )}
          </div>

          {/* Step 6: ASK_CONFIRM big buttons */}
          {pendingConfirmationTrip && (
            <div className="p-4 bg-white border-3 border-ink rounded shadow-hard space-y-3 mt-4">
              <div className="text-base font-bold text-ink">
                Confirm Route {pendingConfirmationTrip.route} to {pendingConfirmationTrip.to} departing at {pendingConfirmationTrip.departs}?
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleConfirmBooking(pendingConfirmationTrip)}
                  className="min-h-[56px] h-14 bg-signal-yellow text-ink border-2 border-ink rounded font-black text-xl shadow-hard hover:bg-yellow-300 active:translate-x-1 active:translate-y-1 focus-visible:ring-4 focus-visible:ring-ink"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPendingConfirmationTrip(null);
                    setTripsResult(null);
                  }}
                  className="min-h-[56px] h-14 bg-paper text-ink border-2 border-ink rounded font-bold text-lg shadow-hard-sm hover:bg-neutral-200 focus-visible:ring-4 focus-visible:ring-ink"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Mic Denied / Missing Speech Fallback (Step 6) */}
      {(micError || !isSpeechRecognitionSupported()) && (
        <section
          role="region"
          aria-label="Manual Destination Search"
          className="bg-white border-3 border-ink rounded p-4 shadow-hard space-y-3"
        >
          <div className="flex items-start gap-2 text-neutral-800">
            <AlertIcon size={20} className="text-ink flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium">
              {micError || 'Microphone not available in this browser.'}
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="e.g. Civil Hospital at 10:30"
              className="flex-1 min-h-[50px] px-3 border-2 border-ink rounded font-medium text-base bg-paper focus:bg-white focus:outline-none"
              aria-label="Type destination or trip request"
            />
            <button
              type="submit"
              disabled={isProcessingVoice}
              className="min-h-[50px] px-5 bg-ink text-white font-bold rounded border-2 border-ink shadow-hard-sm hover:bg-neutral-800"
            >
              Search
            </button>
          </form>

          {/* Quick preset buttons so flow never dead-ends */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => processTranscript('Civil Hospital')}
              className="px-3 py-1.5 bg-paper border border-ink rounded text-xs font-bold hover:bg-signal-yellow"
            >
              Civil Hospital
            </button>
            <button
              type="button"
              onClick={() => processTranscript('Railway Terminal')}
              className="px-3 py-1.5 bg-paper border border-ink rounded text-xs font-bold hover:bg-signal-yellow"
            >
              Railway Terminal
            </button>
            <button
              type="button"
              onClick={() => processTranscript('Central Bus Station')}
              className="px-3 py-1.5 bg-paper border border-ink rounded text-xs font-bold hover:bg-signal-yellow"
            >
              Central Station
            </button>
          </div>
        </section>
      )}

      {/* Step 4: Deaf Mode Phrase Cards */}
      {isDeaf && <DeafPhraseCards />}
    </div>
  );
};
