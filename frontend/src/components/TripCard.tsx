import React from 'react';
import type { Trip } from '../types';
import { RouteBadge } from './ui/RouteBadge';
import { StatusPill } from './ui/StatusPill';
import { ClockIcon, RampIcon, WheelchairIcon, CheckIcon } from './Icons';

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
    <article
      className={`card p-5 transition-all ${
        isExact ? 'border-cobalt ring-2 ring-cobalt/20 shadow-md' : 'hover:border-neutral-400'
      }`}
    >
      {/* Header bar: Badge, Label & Time */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <RouteBadge route={trip.route} className="text-sm px-3 py-1 font-black" />
          {label && (
            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 bg-neutral-100 text-ink rounded border border-neutral-300">
              {label}
            </span>
          )}
        </div>

        {/* Departure Time */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5 font-mono font-bold text-2xl text-ink tabular">
            <ClockIcon size={18} className="text-muted" />
            <time dateTime={trip.departs}>{trip.departs}</time>
          </div>
          {diffMinutes !== undefined && diffMinutes !== 0 && (
            <span className="text-xs font-mono font-medium text-muted block tabular">
              {diffMinutes > 0 ? `+${diffMinutes} min later` : `${diffMinutes} min earlier`}
            </span>
          )}
        </div>
      </div>

      {/* From -> To */}
      <div className="text-base font-bold text-ink mb-3">
        <span>{trip.from}</span>
        <span className="text-muted mx-2" aria-hidden="true">→</span>
        <span>{trip.to}</span>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {trip.status === 'ON_TIME' && <StatusPill status="ON_TIME" />}
        {isDelayed && <StatusPill status="DELAYED" delayMin={trip.delayMin} />}
        {isFull && <StatusPill status="FULL" />}
        {isCancelled && <StatusPill status="CANCELLED" />}

        {/* Accessibility Features */}
        {trip.ramp && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-cobalt border border-blue-200">
            <RampIcon size={13} />
            <span>Ramp Fitted</span>
          </span>
        )}

        {/* Bays free for wheelchair mode */}
        {showWheelchairProminent && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full border ${
              trip.baysFree > 0
                ? 'bg-green-50 text-success border-green-200'
                : 'bg-red-50 text-danger border-red-200'
            }`}
          >
            <WheelchairIcon size={13} />
            <span>{trip.baysFree > 0 ? `${trip.baysFree} bay${trip.baysFree > 1 ? 's' : ''} free` : 'No bays free'}</span>
          </span>
        )}
      </div>

      {/* Reason text if provided */}
      {reason && (
        <p className="text-xs text-muted bg-surface p-3 rounded-btn border border-neutral-200 mb-4">
          {reason}
        </p>
      )}

      {/* Select button */}
      <button
        type="button"
        disabled={isCancelled || isFull}
        onClick={() => onSelect(trip)}
        className={`w-full min-h-[48px] py-2.5 px-4 rounded-btn font-bold text-base transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cobalt ${
          isCancelled || isFull
            ? 'opacity-40 cursor-not-allowed bg-neutral-200 text-neutral-600'
            : isExact
            ? 'btn-primary'
            : 'btn-secondary'
        }`}
      >
        {isExact && <CheckIcon size={18} />}
        <span>{isExact ? 'Select This Bus (Best Match)' : `Choose ${trip.departs} Bus`}</span>
      </button>
    </article>
  );
};
