import React from 'react';
import type { Booking } from '../../types';
import { RouteBadge } from './RouteBadge';
import { StatusPill } from './StatusPill';
import { LocationIcon, ClockIcon, WheelchairIcon, ShareIcon } from '../Icons';

interface TicketCardProps {
  booking: Booking;
  onUndo?: () => void;
  onShare?: () => void;
  showQr?: boolean;
  qrElement?: React.ReactNode;
  className?: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  booking,
  onUndo,
  onShare,
  showQr = false,
  qrElement,
  className = '',
}) => {
  return (
    <div
      className={`card overflow-hidden animate-ticket-in border-2 border-neutral-300 ${className}`}
      aria-label={`Bus ticket for ${booking.from} to ${booking.to}`}
    >
      {/* Header strip */}
      <div className="bg-surface border-b border-neutral-300 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RouteBadge route={booking.tripId.replace('HB-', '') || '102'} className="text-sm font-black" />
          <span className="font-bold text-xs uppercase text-muted tracking-wider">
            E-Boarding Pass
          </span>
        </div>
        <div className="font-mono text-xs font-bold text-muted tabular">
          ID: {booking.id}
        </div>
      </div>

      {/* Main Ticket Info */}
      <div className="p-5 space-y-4">
        {/* Route Times and Status */}
        <div className="flex items-baseline justify-between border-b border-dashed border-neutral-300 pb-3">
          <div>
            <div className="text-xs uppercase font-bold text-muted">Departure</div>
            <div className="text-3xl font-black text-ink font-mono tabular flex items-center gap-1.5">
              <ClockIcon size={22} className="text-cobalt" />
              <span>{booking.departs}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase font-bold text-muted mb-1">Status</div>
            <StatusPill status={booking.status} />
          </div>
        </div>

        {/* Boarding and Destination Stops */}
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <LocationIcon size={20} className="text-cobalt mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs uppercase font-bold text-muted">Boarding Stop</div>
              <div className="text-lg font-bold text-ink">{booking.from}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <LocationIcon size={20} className="text-success mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs uppercase font-bold text-muted">Destination</div>
              <div className="text-lg font-bold text-ink">{booking.to}</div>
            </div>
          </div>
        </div>

        {/* Passenger Profile Instructions sent to Conductor */}
        <div className="bg-surface p-3.5 rounded-btn border border-neutral-200 text-xs space-y-1">
          <div className="font-bold text-ink flex items-center gap-1.5">
            <WheelchairIcon size={16} className="text-cobalt" />
            <span>Passenger: {booking.profile.name}</span>
          </div>
          <div className="text-muted">
            {booking.profile.howToHelp.length > 0
              ? booking.profile.howToHelp.join(' • ')
              : 'Standard assistance requested'}
          </div>
        </div>

        {/* QR Code Section */}
        {showQr && qrElement && (
          <div className="pt-3 border-t border-neutral-200 flex flex-col items-center justify-center">
            <div className="p-3 bg-white border border-neutral-300 rounded-btn shadow-sm mb-2">
              {qrElement}
            </div>
            <span className="text-[11px] font-mono text-muted uppercase">
              Show QR code to conductor for boarding verification
            </span>
          </div>
        )}
      </div>

      {/* Footer buttons if provided */}
      {(onUndo || onShare) && (
        <div className="bg-surface border-t border-neutral-300 px-5 py-3 flex items-center justify-between gap-3">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="text-xs font-bold text-cobalt flex items-center gap-1.5 hover:underline"
            >
              <ShareIcon size={15} />
              <span>Share Ticket</span>
            </button>
          )}

          {onUndo && (
            <button
              type="button"
              onClick={onUndo}
              className="text-xs font-bold text-danger hover:underline ml-auto"
            >
              Cancel Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
};
