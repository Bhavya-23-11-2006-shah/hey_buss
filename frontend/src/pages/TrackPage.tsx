import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import type { BusPosition } from '../types';
import { Button } from '../components/ui/Button';
import { StatusPill } from '../components/ui/StatusPill';
import { RouteBadge } from '../components/ui/RouteBadge';
import { StopTimeline, type StopItem } from '../components/ui/StopTimeline';
import {
  BusIcon,
  LocationIcon,
  CheckIcon,
} from '../components/Icons';
import { speakText, vibrateDevice } from '../utils/speech';

// Lazy load Leaflet Map chunk
const TrackingMap = lazy(() => import('../components/TrackingMap'));

export const TrackPage: React.FC = () => {
  const activeBooking = useStore((state) => state.activeBooking);
  const setActiveBooking = useStore((state) => state.setActiveBooking);
  const profile = useStore((state) => state.profile);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  const [busPosition, setBusPosition] = useState<BusPosition | null>({
    tripId: activeBooking?.tripId || 'HB-803',
    lat: 22.5657,
    lng: 88.3433,
    stopsAway: 2,
    etaMin: 5,
  });

  const [textOnlyMode, setTextOnlyMode] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState<string | null>(null);

  // Subscribe to real-time socket events
  useEffect(() => {
    const unsub = apiClient.subscribeEvents({
      onBookingUpdated: (updated) => {
        setActiveBooking(updated);
        const msg = updated.message || `Booking status: ${updated.status}`;
        setDestinationBoardText(msg);
        if (profile.needs.includes('blind') || profile.needs.includes('deaf')) {
          speakText(msg, profile.language);
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

  // Stops for timeline on Route S12
  const timelineStops: StopItem[] = [
    { id: '1', name: 'Howrah Station', status: 'passed', accessibleNote: 'Barrier-free bay' },
    {
      id: '2',
      name: activeBooking?.from || 'Esplanade (Gate 2)',
      status: busPosition && busPosition.stopsAway <= 1 ? 'current' : 'upcoming',
      isBoarding: true,
      accessibleNote: 'Ramp at Gate 2 • Passenger waiting',
    },
    { id: '3', name: 'Sealdah', status: 'upcoming', accessibleNote: 'Low-floor boarding curb' },
    { id: '4', name: 'Park Circus', status: 'upcoming' },
    {
      id: '5',
      name: activeBooking?.to || 'Salt Lake Sector V',
      status: 'upcoming',
      isDestination: true,
      accessibleNote: 'Wide curb and level boarding lane',
    },
  ];

  const handleBookingEvent = async (type: 'AT_STOP' | 'BUS_HERE' | 'ASSISTING' | 'TAKE_NEXT') => {
    if (!activeBooking) return;
    try {
      setLoadingEvent(type);
      vibrateDevice([100, 50, 100]);

      let voiceMessage = '';
      if (type === 'AT_STOP') {
        voiceMessage = 'Conductor notified: Passenger is waiting at the designated boarding bay.';
      } else if (type === 'BUS_HERE') {
        voiceMessage = 'Bus is here! Driver alerted to lower the hydraulic ramp.';
      } else if (type === 'TAKE_NEXT') {
        voiceMessage = 'Reassigning to the next accessible bus on Route S12.';
      }

      setDestinationBoardText(voiceMessage);
      speakText(voiceMessage, profile.language);

      const updated = await apiClient.sendBookingEvent(activeBooking.id, type);
      setActiveBooking(updated);
    } catch {
      alert('Action could not be completed. Please notify the bus staff.');
    } finally {
      setLoadingEvent(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page explanation */}
      <div className="bg-surface border border-neutral-300 p-3 rounded-card text-xs text-muted flex items-center justify-between">
        <span>📍 <strong>Track:</strong> Live GPS tracking of your accessible bus with stop timeline and conductor alerts.</span>
        <button
          type="button"
          onClick={() => setTextOnlyMode(!textOnlyMode)}
          className="text-cobalt font-bold underline"
        >
          {textOnlyMode ? 'Show Live Map' : 'Text-Only Mode (Screen Readers)'}
        </button>
      </div>

      {/* Live Status Strip */}
      {busPosition && (
        <section
          role="status"
          aria-live="polite"
          className="card p-4 bg-white border-2 border-cobalt flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-btn bg-blue-50 text-cobalt flex items-center justify-center border border-blue-200">
              <BusIcon size={24} />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-ink font-mono tabular">
                {busPosition.stopsAway > 0
                  ? `${busPosition.stopsAway} STOPS AWAY`
                  : 'BUS AT BOARDING STOP'}
              </div>
              <div className="text-xs text-muted">
                Route S12 • Low Floor Ramp • ETA approx {busPosition.etaMin} mins
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RouteBadge route="S12" className="text-sm px-3 py-1 font-black" />
            <StatusPill status={activeBooking?.status || 'CONFIRMED'} />
          </div>
        </section>
      )}

      {/* Main Grid: Map + Timeline/Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Leaflet Map or Text-Only View */}
        <div className="lg:col-span-7 space-y-4">
          {!textOnlyMode ? (
            <div className="card overflow-hidden border border-neutral-300">
              <div className="p-3 bg-surface border-b border-neutral-300 text-xs font-bold text-muted flex justify-between">
                <span>GPS Live Satellite & Route View</span>
                <span>Updates every 2s</span>
              </div>
              <Suspense
                fallback={
                  <div className="w-full h-80 bg-neutral-100 flex items-center justify-center font-mono text-sm text-muted">
                    Loading Kolkata Transit Map...
                  </div>
                }
              >
                <TrackingMap busPosition={busPosition} />
              </Suspense>
            </div>
          ) : (
            <div className="card p-6 bg-surface border border-neutral-300 space-y-3">
              <h2 className="text-lg font-bold text-ink">Text-Only Live Transit Position</h2>
              <p className="text-sm text-ink">
                Your bus (Route S12) is currently between <strong>Howrah Station</strong> and <strong>Esplanade</strong>.
              </p>
              <div className="p-3 bg-white rounded border border-neutral-300 font-mono text-xs">
                <div>CURRENT STATUS: {activeBooking?.status || 'ON_TIME'}</div>
                <div>BOARDING STOP: {activeBooking?.from || 'Esplanade (Gate 2)'}</div>
                <div>DESTINATION: {activeBooking?.to || 'Salt Lake Sector V'}</div>
                <div>ESTIMATED ARRIVAL: {busPosition?.etaMin || 5} minutes</div>
              </div>
            </div>
          )}

          {/* Boarding Action Buttons */}
          <div className="card p-5 space-y-3 bg-white">
            <h2 className="text-base font-bold text-ink">Journey Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* I'm at the stop */}
              <Button
                size="md"
                variant={activeBooking?.status === 'AT_STOP' ? 'ghost' : 'secondary'}
                disabled={loadingEvent === 'AT_STOP' || activeBooking?.status === 'AT_STOP'}
                onClick={() => handleBookingEvent('AT_STOP')}
                leftIcon={<LocationIcon size={18} />}
              >
                {activeBooking?.status === 'AT_STOP' ? 'Waiting at Stop ✓' : "I'm at the Stop"}
              </Button>

              {/* Bus is here */}
              <Button
                size="md"
                variant="primary"
                disabled={loadingEvent === 'BUS_HERE'}
                onClick={() => {
                  if (activeBooking?.status === 'BUS_HERE') {
                    handleBookingEvent('ASSISTING');
                  } else {
                    handleBookingEvent('BUS_HERE');
                  }
                }}
                leftIcon={<CheckIcon size={18} />}
              >
                {activeBooking?.status === 'ASSISTING'
                  ? 'Conductor is Assisting'
                  : 'Bus is Here (Deploy Ramp)'}
              </Button>
            </div>

            {/* Take next bus */}
            <Button
              size="sm"
              variant="ghost"
              fullWidth
              disabled={loadingEvent === 'TAKE_NEXT'}
              onClick={() => handleBookingEvent('TAKE_NEXT')}
            >
              Bus crowded or missed? Take next accessible bus →
            </Button>
          </div>
        </div>

        {/* Right Col: Route Stop Timeline */}
        <div className="lg:col-span-5 card p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <h2 className="text-base font-bold text-ink">Route S12 Timeline</h2>
            <span className="text-xs text-muted">5 Stops</span>
          </div>

          <StopTimeline stops={timelineStops} />
        </div>
      </div>
    </div>
  );
};
