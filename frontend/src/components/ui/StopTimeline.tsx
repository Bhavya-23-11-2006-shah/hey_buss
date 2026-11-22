import React from 'react';
import { LocationIcon, CheckIcon, WheelchairIcon } from '../Icons';

export interface StopItem {
  id: string;
  name: string;
  time?: string;
  status?: 'passed' | 'current' | 'upcoming';
  isBoarding?: boolean;
  isDestination?: boolean;
  accessibleNote?: string;
}

interface StopTimelineProps {
  stops: StopItem[];
  className?: string;
}

export const StopTimeline: React.FC<StopTimelineProps> = ({ stops, className = '' }) => {
  return (
    <div className={`space-y-0 relative ${className}`} aria-label="Route stop timeline">
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1;
        const isCurrent = stop.status === 'current';
        const isPassed = stop.status === 'passed';

        return (
          <div key={stop.id} className="relative flex items-start gap-3 pb-6 group">
            {/* Vertical connector line */}
            {!isLast && (
              <div
                className={`absolute left-[15px] top-[26px] bottom-0 w-[2px] ${
                  isPassed ? 'bg-success' : 'bg-neutral-300'
                }`}
                aria-hidden="true"
              />
            )}

            {/* Bullet / Node icon */}
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-colors ${
                isCurrent
                  ? 'bg-cobalt border-cobalt text-white shadow-md'
                  : isPassed
                  ? 'bg-success border-success text-white'
                  : stop.isBoarding || stop.isDestination
                  ? 'bg-marigold border-ink text-ink font-bold'
                  : 'bg-white border-neutral-400 text-muted'
              }`}
              aria-hidden="true"
            >
              {isPassed ? (
                <CheckIcon size={14} />
              ) : stop.isBoarding || stop.isDestination ? (
                <LocationIcon size={16} />
              ) : (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>

            {/* Stop info */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`text-base font-bold truncate ${
                    isCurrent ? 'text-cobalt font-black' : 'text-ink'
                  }`}
                >
                  {stop.name}
                  {stop.isBoarding && (
                    <span className="ml-2 text-xs font-bold text-cobalt bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Boarding Stop
                    </span>
                  )}
                  {stop.isDestination && (
                    <span className="ml-2 text-xs font-bold text-success bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      Destination
                    </span>
                  )}
                </span>
                {stop.time && (
                  <span className="text-xs text-muted font-mono tabular flex-shrink-0">
                    {stop.time}
                  </span>
                )}
              </div>

              {stop.accessibleNote && (
                <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                  <WheelchairIcon size={14} className="flex-shrink-0 text-cobalt" />
                  <span>{stop.accessibleNote}</span>
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
