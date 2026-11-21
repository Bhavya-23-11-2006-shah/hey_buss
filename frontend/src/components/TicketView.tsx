import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient, MOCK_STOPS } from '../api/client';
import type { BusPosition } from '../types';
import { speakText, vibrateDevice } from '../utils/speech';
import { LocationIcon, CheckIcon, BusIcon } from './Icons';

// Lazy load QR Code and Leaflet Map
const TicketQRCode = lazy(() => import('./TicketQRCode'));
const TrackingMap = lazy(() => import('./TrackingMap'));

export const TicketView: React.FC = () => {
  const activeBooking = useStore((state) => state.activeBooking);
  const setActiveBooking = useStore((state) => state.setActiveBooking);
  const profile = useStore((state) => state.profile);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);
  const setScreen = useStore((state) => state.setScreen);
  const reachedSafely = useStore((state) => state.reachedSafely);
  const setReachedSafely = useStore((state) => state.setReachedSafely);

  const [busPosition, setBusPosition] = useState<BusPosition | null>({
    tripId: activeBooking?.tripId || 'trip-102',
    lat: 28.618,
    lng: 77.212,
    stopsAway: 3,
    etaMin: 6,
  });

  const [showMap, setShowMap] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState<string | null>(null);

  // Subscribe to real-time events
  useEffect(() => {
    const unsub = apiClient.subscribeEvents({
      onBookingUpdated: (updated) => {
        setActiveBooking(updated);
        const announcement = updated.message || `Booking status updated: ${updated.status}`;
        setDestinationBoardText(announcement);
        if (profile.needs.includes('blind') || profile.needs.includes('deaf')) {
          speakText(announcement, profile.language);
          vibrateDevice([150, 80, 150]);
        }
      },
      onBusPosition: (pos) => {
        setBusPosition((prev) => {
          if (prev && prev.stopsAway !== pos.stopsAway) {
            const etaMsg =
              profile.language === 'hi'
                ? `बस ${pos.stopsAway} स्टॉप दूर है। लगभग ${pos.etaMin} मिनट में पहुँचेगी।`
                : `Bus is ${pos.stopsAway} stop${pos.stopsAway > 1 ? 's' : ''} away. ETA ${pos.etaMin} minutes.`;
            setDestinationBoardText(etaMsg);
            speakText(etaMsg, profile.language);
            vibrateDevice([200, 100, 200]);
          }
          return pos;
        });
      },
    });

    return () => unsub();
  }, [profile]);

  if (!activeBooking) {
    return (
      <div className="bg-white border-3 border-ink rounded p-6 shadow-hard text-center space-y-4">
        <h2 className="text-2xl font-serif font-black">No Active Ticket</h2>
        <p className="text-neutral-700">You don't have an active trip booked right now.</p>
        <button
          type="button"
          onClick={() => setScreen('home')}
          className="min-h-[56px] px-6 bg-signal-yellow text-ink border-2 border-ink rounded font-black text-lg shadow-hard hover:bg-yellow-300"
        >
          Book a Bus
        </button>
      </div>
    );
  }

  // Find stop note
  const boardingStopObj = MOCK_STOPS.find(
    (s) => s.name.toLowerCase() === activeBooking.from.toLowerCase()
  ) || MOCK_STOPS[0];

  const handleBookingEvent = async (type: 'AT_STOP' | 'BUS_HERE' | 'ASSISTING' | 'TAKE_NEXT') => {
    try {
      setLoadingEvent(type);
      vibrateDevice([100, 50, 100]);

      let voiceMessage = '';
      if (type === 'AT_STOP') {
        voiceMessage =
          profile.language === 'hi'
            ? 'कंडक्टर को सूचित किया गया: आप बस स्टॉप पर पहुँच गए हैं।'
            : "Conductor notified: You are waiting at the boarding bay.";
      } else if (type === 'BUS_HERE') {
        voiceMessage =
          profile.language === 'hi'
            ? 'बस यहाँ है। कंडक्टर को रैंप तैनात करने का संदेश दिया गया।'
            : 'Bus is here! Driver and conductor alerted to assist you now.';
      } else if (type === 'TAKE_NEXT') {
        voiceMessage =
          profile.language === 'hi'
            ? 'आपको अगली सुगम बस में स्थानांतरित किया जा रहा है।'
            : 'Reassigning you to the next available accessible bus.';
      }

      setDestinationBoardText(voiceMessage);
      speakText(voiceMessage, profile.language);

      const updated = await apiClient.sendBookingEvent(activeBooking.id, type);
      setActiveBooking(updated);
    } catch (err) {
      console.warn('Booking event failed:', err);
    } finally {
      setLoadingEvent(null);
    }
  };

  const handleSafeArrival = () => {
    vibrateDevice([150, 100, 150, 100, 250]);
    setReachedSafely(true);

    const msg =
      profile.language === 'hi'
        ? 'सकुशल आगमन! आशा है आपकी यात्रा आरामदायक रही।'
        : 'Reached safely! Thank you for riding with Hey Buss.';
    setDestinationBoardText(msg);
    speakText(msg, profile.language);
  };

  const isAssisting = activeBooking.status === 'ASSISTING';
  const isAtStop = activeBooking.status === 'AT_STOP';

  return (
    <div className="space-y-6 pb-12">
      {/* N Stops Away Live Banner */}
      {busPosition && (
        <section
          role="status"
          aria-live="polite"
          className="bg-ink text-white border-3 border-signal-yellow rounded p-3 shadow-hard flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-signal-yellow text-ink border-2 border-white rounded shadow-hard-sm">
              <BusIcon size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-signal-yellow font-mono">
                {busPosition.stopsAway > 0
                  ? `${busPosition.stopsAway} STOP${busPosition.stopsAway > 1 ? 'S' : ''} AWAY`
                  : 'BUS AT THE STOP'}
              </div>
              <div className="text-xs text-neutral-300 font-mono">
                ETA approx {busPosition.etaMin} minutes • Route 102
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="px-3 py-1.5 bg-paper text-ink border-2 border-white text-xs font-mono font-bold rounded shadow-hard-sm hover:bg-neutral-200"
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </section>
      )}

      {/* Lazy-Loaded Leaflet Map or Text list fallback */}
      {showMap && (
        <Suspense
          fallback={
            <div className="w-full h-48 bg-neutral-200 border-2 border-ink rounded flex items-center justify-center font-mono text-sm">
              Loading Transit Map...
            </div>
          }
        >
          <TrackingMap busPosition={busPosition} />
        </Suspense>
      )}

      {/* Printed-Ticket Card */}
      <article
        aria-label="Official Transit Boarding Ticket"
        className="bg-white border-3 border-ink rounded shadow-hard-lg overflow-hidden relative"
      >
        {/* Ticket Header */}
        <div className="bg-signal-yellow border-b-3 border-ink p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black italic text-2xl text-ink">Hey</span>
            <span className="px-2 py-0.5 bg-ink text-white font-mono font-black text-lg rounded">
              TICKET
            </span>
          </div>
          <div className="text-right font-mono text-xs font-extrabold uppercase text-ink">
            ID: {activeBooking.id}
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-5 space-y-4">
          {/* Route & Times */}
          <div className="flex items-start justify-between border-b-2 border-dashed border-neutral-300 pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-neutral-500">
                Route
              </span>
              <div className="text-3xl font-black text-ink">
                Line 102
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 bg-neutral-100 text-xs font-bold border border-ink rounded">
                Low-Floor Ramp Fitted
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold uppercase text-neutral-500">
                Departure
              </span>
              <div className="text-3xl font-mono font-black text-ink">
                {activeBooking.departs}
              </div>
              <span className="text-xs font-bold text-transit-green">
                Confirmed
              </span>
            </div>
          </div>

          {/* Boarding Stop & Accessible Features */}
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold uppercase text-neutral-500">
              Boarding Stop
            </div>
            <div className="text-xl font-bold text-ink flex items-center gap-1.5">
              <LocationIcon size={20} />
              <span>{activeBooking.from}</span>
            </div>
            {boardingStopObj.note && (
              <p className="text-xs bg-paper p-2 border border-ink rounded font-medium text-neutral-800">
                <span className="font-bold">Accessibility Note:</span> {boardingStopObj.note}
              </p>
            )}
          </div>

          {/* Destination */}
          <div>
            <div className="text-xs font-mono font-bold uppercase text-neutral-500">
              Destination Stop
            </div>
            <div className="text-xl font-bold text-ink">
              {activeBooking.to}
            </div>
          </div>

          {/* Passenger Assistance Profile */}
          <div className="bg-paper border-2 border-ink p-3 rounded space-y-1">
            <div className="text-xs font-mono font-bold uppercase text-neutral-600">
              Passenger Assistance Profile (Sent to Driver):
            </div>
            <div className="text-sm font-bold text-ink">
              {activeBooking.profile.name} • Needs: {activeBooking.profile.needs.join(', ') || 'Standard'}
            </div>
            <div className="text-xs text-neutral-700">
              {activeBooking.profile.howToHelp.join(' • ') || 'Standard assistance'}
            </div>
          </div>

          {/* Live Conductor Status */}
          <div className="border-2 border-ink p-3 rounded bg-neutral-50 space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-neutral-500">
              Conductor Status
            </span>
            <div className="text-base font-black text-ink flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-signal-yellow animate-pulse border border-ink" />
              <span>
                {activeBooking.status === 'CONFIRMED' && 'Conductor has been told'}
                {activeBooking.status === 'AT_STOP' && 'Conductor notified: Passenger waiting at stop'}
                {activeBooking.status === 'BUS_HERE' && 'Conductor alerted to assist boarding'}
                {activeBooking.status === 'ASSISTING' && 'Conductor is assisting you'}
                {activeBooking.status === 'REASSIGNED' && 'Reassigned to next accessible bus'}
                {activeBooking.status === 'CANCELLED' && 'Trip Cancelled'}
              </span>
            </div>
            {activeBooking.message && (
              <p className="text-xs font-mono text-neutral-600">
                {activeBooking.message}
              </p>
            )}
          </div>

          {/* Perforated Divider */}
          <div className="relative my-4">
            <div className="border-t-2 border-dashed border-ink w-full" />
            <div className="absolute -left-7 -top-3 w-6 h-6 rounded-full bg-paper border-r-3 border-ink" />
            <div className="absolute -right-7 -top-3 w-6 h-6 rounded-full bg-paper border-l-3 border-ink" />
          </div>

          {/* Lazy Loaded QR Code */}
          <div className="text-center pt-2">
            <Suspense
              fallback={
                <div className="w-36 h-36 bg-neutral-100 border-2 border-dashed border-ink mx-auto flex items-center justify-center font-mono text-xs">
                  Loading QR...
                </div>
              }
            >
              <TicketQRCode data={`HEYBUSS:${activeBooking.id}:${activeBooking.from}:${activeBooking.to}`} />
            </Suspense>
          </div>
        </div>
      </article>

      {/* Ticket Interactive Action Buttons */}
      <section
        aria-label="Boarding Status Actions"
        className="space-y-3"
      >
        <h3 className="text-lg font-serif font-bold text-ink">
          Boarding Action Buttons
        </h3>

        {/* 1. I'm at the stop */}
        <button
          type="button"
          disabled={loadingEvent === 'AT_STOP' || isAtStop}
          onClick={() => handleBookingEvent('AT_STOP')}
          className={`w-full min-h-[56px] h-14 border-3 border-ink rounded font-black text-lg shadow-hard transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink ${
            isAtStop
              ? 'bg-neutral-200 text-neutral-700 cursor-default'
              : 'bg-white text-ink hover:bg-neutral-100 active:translate-x-1 active:translate-y-1'
          }`}
        >
          {isAtStop && <CheckIcon size={20} />}
          <span>{isAtStop ? "You are at the stop" : "I'm at the stop (Alert Conductor)"}</span>
        </button>

        {/* 2. Bus is here (turns green when status is ASSISTING) */}
        <button
          type="button"
          disabled={loadingEvent === 'BUS_HERE'}
          onClick={() => {
            // First click sets BUS_HERE, next sets ASSISTING for realistic simulation
            if (activeBooking.status === 'BUS_HERE') {
              handleBookingEvent('ASSISTING');
            } else {
              handleBookingEvent('BUS_HERE');
            }
          }}
          className={`w-full min-h-[56px] h-14 border-3 border-ink rounded font-black text-lg shadow-hard transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink ${
            isAssisting
              ? 'bg-transit-green text-white shadow-hard-lg'
              : 'bg-signal-yellow text-ink hover:bg-yellow-300 active:translate-x-1 active:translate-y-1'
          }`}
        >
          {isAssisting && <CheckIcon size={22} />}
          <span>
            {isAssisting
              ? 'Conductor is assisting you'
              : 'Bus is here (Deploy Ramp)'}
          </span>
        </button>

        {/* 3. Take the next one */}
        <button
          type="button"
          disabled={loadingEvent === 'TAKE_NEXT'}
          onClick={() => handleBookingEvent('TAKE_NEXT')}
          className="w-full min-h-[56px] h-14 bg-paper border-2 border-ink rounded font-bold text-base shadow-hard-sm hover:bg-neutral-200 active:translate-x-0.5 active:translate-y-0.5 text-neutral-800 focus-visible:ring-4 focus-visible:ring-ink"
        >
          Take the next one (Reassign Bus)
        </button>
      </section>

      {/* Step 11: Safe Arrival Card */}
      <section className="bg-white border-3 border-ink rounded p-4 shadow-hard space-y-3">
        <h3 className="text-xl font-serif font-black text-ink">
          Destination Arrival
        </h3>
        {reachedSafely ? (
          <div
            role="status"
            aria-live="polite"
            className="p-4 bg-green-50 border-2 border-transit-green rounded text-transit-green font-bold text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-2 text-2xl font-black">
              <CheckIcon size={28} />
              <span>Reached safely!</span>
            </div>
            <p className="text-sm text-neutral-800">
              Trip completed. Conductor and dispatch logs closed.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveBooking(null);
                setReachedSafely(false);
                setScreen('home');
              }}
              className="mt-2 min-h-[50px] px-6 bg-ink text-white font-black rounded border-2 border-ink shadow-hard-sm hover:bg-neutral-800"
            >
              Book Another Ride
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-neutral-700 mb-3">
              Tap below when you have safely stepped or rolled off the bus at {activeBooking.to}:
            </p>
            <button
              type="button"
              onClick={handleSafeArrival}
              className="w-full min-h-[56px] h-14 bg-white border-3 border-ink text-ink font-black text-lg rounded shadow-hard hover:bg-signal-yellow active:translate-x-1 active:translate-y-1 transition-all focus-visible:ring-4 focus-visible:ring-ink"
            >
              Reached safely
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
