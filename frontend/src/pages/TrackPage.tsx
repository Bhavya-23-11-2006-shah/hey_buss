import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import type { BusPosition, Stop } from '../types';
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
  const activeRoute = activeBooking?.tripId.startsWith('HB-9') ? 'A4' : 'S12';
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  const [busPosition, setBusPosition] = useState<BusPosition | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const mapStops = useMemo(() => {
    if (!activeBooking) return stops;
    const journeyStops = stops.filter(
      (stop) => stop.name === activeBooking.from || stop.name === activeBooking.to
    );
    return journeyStops.length > 0 ? journeyStops : stops;
  }, [stops, activeBooking]);

  const [textOnlyMode, setTextOnlyMode] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void apiClient.getStops().then((loadedStops) => {
      if (active) setStops(loadedStops);
    });
    return () => {
      active = false;
    };
  }, []);

  // Subscribe to real-time socket events
  useEffect(() => {
    const unsub = apiClient.subscribeEvents({
      onBookingUpdated: (updated) => {
        if (!activeBooking || updated.id !== activeBooking.id) return;
        setActiveBooking(updated);
        const msg = updated.message || `Booking status: ${updated.status}`;
        setDestinationBoardText(msg);
        if (profile.needs.includes('blind') || profile.needs.includes('deaf')) {
          speakText(msg, profile.language);
          vibrateDevice([150, 80, 150]);
        }
      },
      onBusPosition: (pos) => {
        if (!activeBooking || pos.tripId !== activeBooking.tripId) return;
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
  }, [profile, activeBooking, setActiveBooking, setDestinationBoardText]);

  const timelineStops: StopItem[] = activeBooking ? [
    { id: 'boarding', name: activeBooking.from, status: busPosition?.stopsAway === 0 ? 'current' : 'upcoming', isBoarding: true },
    { id: 'destination', name: activeBooking.to, status: 'upcoming', isDestination: true },
  ] : [];

  const handleBookingEvent = async (type: 'AT_STOP' | 'BUS_HERE' | 'ASSISTING' | 'TAKE_NEXT') => {
    if (!activeBooking) return;
    try {
      setLoadingEvent(type);
      vibrateDevice([100, 50, 100]);

      const updated = await apiClient.sendBookingEvent(activeBooking.id, type);
      setActiveBooking(updated);
      const message = type === 'TAKE_NEXT'
        ? updated.status === 'REASSIGNED'
          ? `You are reassigned to the ${updated.departs} demo trip.`
          : 'No later accessible trip is available; the booking was cancelled.'
        : `Your ${type === 'AT_STOP' ? 'at-stop' : type === 'BUS_HERE' ? 'bus-arrival' : 'assistance'} status was recorded on the Hey Buss server. This demo does not contact bus staff automatically.`;
      setDestinationBoardText(message);
      speakText(message, profile.language);
    } catch {
      const message = 'The action could not be saved. No staff notification was confirmed.';
      setDestinationBoardText(message);
      speakText(message, profile.language);
    } finally {
      setLoadingEvent(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Page explanation */}
      <div className="bg-surface border border-neutral-300 p-3 rounded-card text-xs text-muted flex items-center justify-between">
        <span>📍 <strong>Track:</strong> View your accessible route and the backend’s demo bus location stream.</span>
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
                Route {activeRoute} • Demo bus position • ETA approx {busPosition.etaMin} mins
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RouteBadge route={activeRoute} className="text-sm px-3 py-1 font-black" />
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
                <span>OpenFreeMap • Demo bus location</span>
                <span>Updates every 2s</span>
              </div>
              <Suspense
                fallback={
                  <div className="w-full h-80 bg-neutral-100 flex items-center justify-center font-mono text-sm text-muted">
                    Loading Kolkata Transit Map...
                  </div>
                }
              >
                <TrackingMap busPosition={busPosition} stops={mapStops} />
              </Suspense>
            </div>
          ) : (
            <div className="card p-6 bg-surface border border-neutral-300 space-y-3">
              <h2 className="text-lg font-bold text-ink">Text-Only Live Transit Position</h2>
              <p className="text-sm text-ink">
                {busPosition
                  ? <>Your bus is currently {busPosition.stopsAway} stop{busPosition.stopsAway === 1 ? '' : 's'} away.</>
                  : <>Waiting for the first bus location update.</>}
              </p>
              <div className="p-3 bg-white rounded border border-neutral-300 font-mono text-xs">
                <div>CURRENT STATUS: {activeBooking?.status || 'ON_TIME'}</div>
                <div>BOARDING STOP: {activeBooking?.from || 'Esplanade (Gate 2)'}</div>
                <div>DESTINATION: {activeBooking?.to || 'Salt Lake Sector V'}</div>
                <div>ESTIMATED ARRIVAL: {busPosition ? `${busPosition.etaMin} minutes` : 'Waiting for update'}</div>
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
                disabled={!activeBooking || loadingEvent === 'AT_STOP' || activeBooking.status === 'AT_STOP'}
                onClick={() => handleBookingEvent('AT_STOP')}
                leftIcon={<LocationIcon size={18} />}
              >
                {activeBooking?.status === 'AT_STOP' ? 'Waiting at Stop ✓' : "I'm at the Stop"}
              </Button>

              {/* Bus is here */}
              <Button
                size="md"
                variant="primary"
                disabled={!activeBooking || loadingEvent === 'BUS_HERE'}
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
              disabled={!activeBooking || loadingEvent === 'TAKE_NEXT'}
              onClick={() => handleBookingEvent('TAKE_NEXT')}
            >
              Bus crowded or missed? Take next accessible bus →
            </Button>
          </div>
        </div>

        {/* Right Col: Route Stop Timeline */}
        <div className="lg:col-span-5 card p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
            <h2 className="text-base font-bold text-ink">Your Trip</h2>
            <span className="text-xs text-muted">{activeBooking ? '2 stops' : 'No booking'}</span>
          </div>

          {activeBooking ? <StopTimeline stops={timelineStops} /> : <p className="text-sm text-muted">Book a trip to see its boarding and destination stops.</p>}
        </div>
      </div>
    </div>
  );
};
