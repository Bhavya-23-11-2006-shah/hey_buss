import React from 'react';
import type { Trip } from '../types';
import { ClockIcon, RampIcon, WheelchairIcon, AlertIcon } from './Icons';

interface TripCardProps {
  trip: Trip;
  isExact?: boolean;
  label?: string;
  diffMinutes?: number;
  reason?: string;
  onSelect: (trip: Trip) => void;
  showWheelchairProminent?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  isExact = false,
  label,
  diffMinutes,
  reason,
  onSelect,
  showWheelchairProminent = false,
}) => {
  const isDelayed = trip.status === 'DELAYED' || trip.delayMin > 0;
  const isFull = trip.status === 'FULL';
  const isCancelled = trip.status === 'CANCELLED';

  return (
    <div
      className={`border-3 border-ink rounded p-4 shadow-hard transition-all ${
        isExact ? 'bg-white ring-2 ring-signal-yellow' : 'bg-paper'
      }`}
    >
      {/* Header bar: Badge, Label & Time */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Route Badge */}
          <div className="bg-signal-yellow border-2 border-ink px-2.5 py-1 rounded font-black text-xl tracking-wider text-ink shadow-hard-sm">
            Route {trip.route}
          </div>
          {label && (
            <span className="text-xs font-mono font-extrabold uppercase px-2 py-0.5 bg-ink text-white rounded">
              {label}
            </span>
          )}
        </div>

        {/* Departure Time */}
        <div className="text-right">
          <div className="flex items-center gap-1 font-mono font-black text-2xl text-ink">
            <ClockIcon size={20} />
            <span>{trip.departs}</span>
          </div>
          {diffMinutes !== undefined && diffMinutes !== 0 && (
            <span className="text-xs font-mono font-bold text-neutral-600 block">
              {diffMinutes > 0 ? `+${diffMinutes} min later` : `${diffMinutes} min earlier`}
            </span>
          )}
        </div>
      </div>

      {/* From -> To */}
      <div className="text-base font-bold text-neutral-800 mb-2">
        <span>{trip.from}</span> <span className="text-neutral-500">→</span> <span>{trip.to}</span>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {trip.status === 'ON_TIME' && (
          <span className="px-2 py-0.5 text-xs font-black uppercase bg-green-100 text-transit-green border border-transit-green rounded">
            On Time
          </span>
        )}
        {isDelayed && (
          <span className="px-2 py-0.5 text-xs font-black uppercase bg-yellow-100 text-yellow-900 border border-yellow-900 rounded flex items-center gap-1">
            <AlertIcon size={14} /> Delayed (+{trip.delayMin}m)
          </span>
        )}
        {isFull && (
          <span className="px-2 py-0.5 text-xs font-black uppercase bg-red-100 text-sos-red border border-sos-red rounded">
            Bus Full
          </span>
        )}
        {isCancelled && (
          <span className="px-2 py-0.5 text-xs font-black uppercase bg-red-200 text-sos-red border border-sos-red rounded">
            Cancelled
          </span>
        )}

        {/* Accessibility Features */}
        {trip.ramp && (
          <span className="px-2 py-0.5 text-xs font-bold bg-white border border-ink rounded flex items-center gap-1 text-ink">
            <RampIcon size={14} /> Hydraulic Ramp
          </span>
        )}

        {/* Prominent Bays Free for Wheelchair Mode */}
        {showWheelchairProminent && (
          <span
            className={`px-2.5 py-0.5 text-xs font-extrabold border-2 border-ink rounded flex items-center gap-1 ${
              trip.baysFree > 0 ? 'bg-signal-yellow text-ink' : 'bg-red-100 text-sos-red'
            }`}
          >
            <WheelchairIcon size={14} />
            {trip.baysFree > 0
              ? `${trip.baysFree} Bay${trip.baysFree > 1 ? 's' : ''} Free`
              : 'No Bays Available'}
          </span>
        )}
      </div>

      {/* Reason text if provided */}
      {reason && (
        <p className="text-xs font-mono text-neutral-700 bg-neutral-100 p-2 border border-neutral-300 rounded mb-3">
          {reason}
        </p>
      )}

      {/* Select / Book this trip button */}
      <button
        type="button"
        disabled={isCancelled || isFull}
        onClick={() => onSelect(trip)}
        className={`w-full min-h-[50px] font-black text-lg border-2 border-ink rounded shadow-hard-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink ${
          isCancelled || isFull
            ? 'opacity-50 cursor-not-allowed bg-neutral-200'
            : isExact
            ? 'bg-signal-yellow text-ink hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5'
            : 'bg-white text-ink hover:bg-neutral-100'
        }`}
      >
        {isExact ? 'Select This Trip (Recommended)' : `Choose ${trip.departs} Bus`}
      </button>
    </div>
  );
};
