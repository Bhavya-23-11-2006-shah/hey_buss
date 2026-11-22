import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import type { Trip, TripsSearchResult } from '../types';
import { Button } from '../components/ui/Button';
import { TripCard } from '../components/TripCard';
import { RouteBadge } from '../components/ui/RouteBadge';
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '../components/Icons';
import { speakText, vibrateDevice } from '../utils/speech';

export const BookPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useStore((state) => state.profile);
  const setActiveBooking = useStore((state) => state.setActiveBooking);
  const setBookingTimestamp = useStore((state) => state.setBookingTimestamp);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  // 3-step stepper: 1 (Where) -> 2 (Pick a bus) -> 3 (Confirm)
  const initialVoice = location.state?.voiceResponse;
  const initialDestination = location.state?.destination || initialVoice?.entities?.to;
  const initialOrigin = initialVoice?.entities?.from || (initialDestination === 'Airport Gate 3' ? 'Howrah Station' : 'Esplanade');
  const [step, setStep] = useState<1 | 2 | 3>(initialVoice?.uiAction?.trips ? 2 : 1);

  // Form states (real Kolkata stops)
  const [fromStop, setFromStop] = useState(initialOrigin);
  const [toStop, setToStop] = useState(initialDestination || 'Salt Lake Sector V');
  const [time, setTime] = useState(initialVoice?.entities?.time || '09:00');

  // Search & confirmation results
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [tripsResult, setTripsResult] = useState<TripsSearchResult | null>(initialVoice?.uiAction?.trips || null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Slide-to-confirm progress
  const [sliderVal, setSliderVal] = useState(0);

  const routeOptions = [
    { from: 'Esplanade', to: 'Salt Lake Sector V' },
    { from: 'Howrah Station', to: 'Airport Gate 3' },
  ];
  const destination = routeOptions.find((route) => route.from === fromStop)?.to;
  const timeDifference = (departure: string) => {
    const toMinutes = (value: string) => {
      const [hours, minutes] = value.split(':').map(Number);
      return hours * 60 + minutes;
    };
    return toMinutes(departure) - toMinutes(time);
  };

  // Step 1: Search trips
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    vibrateDevice(60);

    try {
      const res = await apiClient.searchTrips(fromStop, toStop, time, profile.needs);
      setTripsResult(res);
      setStep(2);

      const msg = `Found buses for ${fromStop} to ${toStop} around ${time}.`;
      setDestinationBoardText(msg);
      if (profile.needs.includes('blind')) {
        speakText(msg, profile.language);
      }
    } catch {
      setDestinationBoardText('Search error. Please try another stop.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Choose trip
  const handleSelectTrip = (trip: Trip) => {
    vibrateDevice(80);
    setSelectedTrip(trip);
    setStep(3);

    const msg = `Selected Route ${trip.route} departing ${trip.departs}. Please confirm your booking.`;
    setDestinationBoardText(msg);
    if (profile.needs.includes('blind')) {
      speakText(msg, profile.language);
    }
  };

  // Step 3: Final confirmation
  const handleConfirmBooking = async () => {
    if (!selectedTrip || confirming) return;
    setConfirming(true);
    vibrateDevice(150);

    try {
      const booking = await apiClient.createBooking(
        selectedTrip.id,
        fromStop,
        toStop,
        profile
      );
      setActiveBooking(booking);
      setBookingTimestamp(Date.now());

      const successMsg = `Booking confirmed! Route ${selectedTrip.route} at ${selectedTrip.departs}. Boarding pass created.`;
      setDestinationBoardText(successMsg);
      speakText(successMsg, profile.language);

      navigate('/app/tickets');
    } catch {
      setSliderVal(0);
      alert('Booking could not be completed. Please try an earlier or later bus.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Page explanation */}
      <div className="bg-surface border border-neutral-300 p-3 rounded-card text-xs text-muted flex items-center justify-between">
        <span>📋 <strong>Book:</strong> Three-step reservation using the demo trip’s listed ramp and bay availability.</span>
        <span className="font-mono font-bold text-cobalt">Step {step} of 3</span>
      </div>

      {/* Stepper Header */}
      <nav aria-label="Booking steps" className="card p-4 bg-white border border-neutral-300">
        <ol className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <li className={`flex items-center gap-2 ${step >= 1 ? 'text-cobalt' : 'text-muted'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-cobalt bg-blue-50 text-cobalt' : 'border-neutral-300'}`}>
              1
            </span>
            <span>Where</span>
          </li>
          <li className="w-12 h-0.5 bg-neutral-200" aria-hidden="true" />
          <li className={`flex items-center gap-2 ${step >= 2 ? 'text-cobalt' : 'text-muted'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-cobalt bg-blue-50 text-cobalt' : 'border-neutral-300'}`}>
              2
            </span>
            <span>Pick a Bus</span>
          </li>
          <li className="w-12 h-0.5 bg-neutral-200" aria-hidden="true" />
          <li className={`flex items-center gap-2 ${step === 3 ? 'text-cobalt' : 'text-muted'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${step === 3 ? 'border-cobalt bg-blue-50 text-cobalt' : 'border-neutral-300'}`}>
              3
            </span>
            <span>Confirm</span>
          </li>
        </ol>
      </nav>

      {/* STEP 1: WHERE */}
      {step === 1 && (
        <form onSubmit={handleSearch} className="card p-6 bg-white space-y-5">
          <h2 className="text-xl font-bold text-ink">1. Where would you like to travel?</h2>

          <div className="space-y-4">
            {/* Origin Stop */}
            <div className="space-y-1">
              <label htmlFor="from-stop" className="block text-xs font-bold uppercase text-muted">
                Boarding Stop (Origin)
              </label>
              <select
                id="from-stop"
                value={fromStop}
                onChange={(e) => {
                  const nextFrom = e.target.value;
                  setFromStop(nextFrom);
                  setToStop(routeOptions.find((route) => route.from === nextFrom)?.to || '');
                }}
                className="input font-bold"
              >
                {routeOptions.map((route) => <option key={route.from} value={route.from}>{route.from}</option>)}
              </select>
            </div>

            {/* Destination Stop */}
            <div className="space-y-1">
              <label htmlFor="to-stop" className="block text-xs font-bold uppercase text-muted">
                Destination Stop
              </label>
              <select
                id="to-stop"
                value={toStop}
                onChange={(e) => setToStop(e.target.value)}
                className="input font-bold"
              >
                {destination && <option value={destination}>{destination}</option>}
              </select>
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label htmlFor="trip-time" className="block text-xs font-bold uppercase text-muted">
                Desired Time (24-Hour)
              </label>
              <input
                id="trip-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input font-mono tabular"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            fullWidth
            loading={loading}
            rightIcon={<ChevronRightIcon size={20} />}
          >
            Find Accessible Buses
          </Button>
        </form>
      )}

      {/* STEP 2: PICK A BUS */}
      {step === 2 && tripsResult && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink">2. Choose Your Bus</h2>
              <p className="text-xs text-muted">{fromStop} → {toStop} around {time}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setStep(1)} leftIcon={<ChevronLeftIcon size={16} />}>
              Change Route
            </Button>
          </div>

          {/* Exact Match */}
          {tripsResult.exact ? (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Best Accessible Match
              </span>
              <TripCard
                trip={tripsResult.exact}
                isExact={true}
                label="Exact Match"
                reason={tripsResult.reason}
                onSelect={handleSelectTrip}
                showWheelchairProminent={profile.needs.includes('wheelchair')}
              />
            </div>
          ) : (
            <div className="p-4 bg-surface border border-neutral-300 rounded-card text-sm text-ink font-medium">
              No exact match at {time}. Here are the closest accessible low-floor buses:
            </div>
          )}

          {/* Closest to Your Time: Earlier / Later */}
          {(tripsResult.earlier || tripsResult.later) && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                Alternative Times
              </h3>

              {tripsResult.earlier && (
                <TripCard
                  trip={tripsResult.earlier}
                  label="Earlier"
                  diffMinutes={timeDifference(tripsResult.earlier.departs)}
                  reason="Earlier departure available in the sample schedule"
                  onSelect={handleSelectTrip}
                  showWheelchairProminent={profile.needs.includes('wheelchair')}
                />
              )}

              {tripsResult.later && (
                <TripCard
                  trip={tripsResult.later}
                  label="Later"
                  diffMinutes={timeDifference(tripsResult.later.departs)}
                  reason="Later departure available in the sample schedule"
                  onSelect={handleSelectTrip}
                  showWheelchairProminent={profile.needs.includes('wheelchair')}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: CONFIRM */}
      {step === 3 && selectedTrip && (
        <div className="card p-6 bg-white space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div>
              <h2 className="text-xl font-bold text-ink">3. Confirm Your Booking</h2>
              <p className="text-xs text-muted">Review trip details and the assistance profile stored with this demo booking.</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setStep(2)}>
              Change Bus
            </Button>
          </div>

          {/* Ticket-style Summary */}
          <div className="card bg-surface p-5 border border-neutral-300 space-y-3">
            <div className="flex items-center justify-between">
              <RouteBadge route={selectedTrip.route} className="text-sm font-black" />
              <div className="text-2xl font-mono font-black text-ink tabular">{selectedTrip.departs}</div>
            </div>

            <div className="text-lg font-bold text-ink">
              {fromStop} → {toStop}
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold">
              {selectedTrip.ramp && (
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-cobalt border border-blue-200">
                  Ramp listed
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-green-50 text-success border border-green-200">
                {selectedTrip.baysFree} Open Wheelchair Bay{selectedTrip.baysFree > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Assistance Checklist transmitted to conductor */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Assistance profile included with the booking:
            </h3>
            <ul className="space-y-2 text-sm font-medium text-ink">
              <li className="flex items-center gap-2 p-2.5 bg-surface rounded-btn border border-neutral-200">
                <CheckIcon size={16} className="text-success" />
                <span>Passenger name: <strong>{profile.name}</strong></span>
              </li>
              {profile.howToHelp.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 p-2.5 bg-surface rounded-btn border border-neutral-200">
                  <CheckIcon size={16} className="text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Slide-to-Confirm or Tap Alternative */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label htmlFor="slide-confirm" className="block text-xs font-bold text-muted uppercase">
                Slide to Confirm (or tap button below)
              </label>
              <input
                id="slide-confirm"
                type="range"
                min="0"
                max="100"
                value={sliderVal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSliderVal(val);
                  if (val >= 95 && !confirming) {
                    setSliderVal(100);
                    handleConfirmBooking();
                  }
                }}
                disabled={confirming}
                className="w-full h-3 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-cobalt disabled:opacity-50"
              />
            </div>

            <Button
              size="lg"
              variant="primary"
              fullWidth
              loading={confirming}
              onClick={handleConfirmBooking}
              className="text-lg font-black min-h-[56px]"
            >
              Tap to Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
