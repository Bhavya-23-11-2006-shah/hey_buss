import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import { speakText, vibrateDevice } from '../utils/speech';
import { UndoIcon } from './Icons';

export const UndoToast: React.FC = () => {
  const activeBooking = useStore((state) => state.activeBooking);
  const setActiveBooking = useStore((state) => state.setActiveBooking);
  const bookingTimestamp = useStore((state) => state.bookingTimestamp);
  const setBookingTimestamp = useStore((state) => state.setBookingTimestamp);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);
  const profile = useStore((state) => state.profile);

  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isUndoing, setIsUndoing] = useState(false);

  useEffect(() => {
    if (!bookingTimestamp || !activeBooking || activeBooking.status === 'CANCELLED') {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - bookingTimestamp) / 1000;
      const left = Math.max(0, Math.ceil(30 - elapsed));
      setSecondsRemaining(left);

      if (left <= 0) {
        setBookingTimestamp(null);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [bookingTimestamp, activeBooking, setBookingTimestamp]);

  if (!bookingTimestamp || secondsRemaining <= 0 || !activeBooking || activeBooking.status === 'CANCELLED') {
    return null;
  }

  const handleUndo = async () => {
    try {
      setIsUndoing(true);
      vibrateDevice(150);
      const cancelled = await apiClient.undoBooking(activeBooking.id);
      setActiveBooking(cancelled);
      setBookingTimestamp(null);

      const msg =
        profile.language === 'hi'
          ? 'बुकिंग रद्द कर दी गई है।'
          : 'Booking successfully undone and cancelled.';
      setDestinationBoardText(msg);
      speakText(msg, profile.language);
    } catch (err) {
      console.warn('Undo failed:', err);
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-24 sm:bottom-6 left-4 right-4 max-w-md mx-auto z-40 bg-white border-2 border-cobalt p-4 rounded-card shadow-card-md flex items-center justify-between gap-3 animate-fade-in"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping" />
          <span className="font-bold text-sm tracking-wide text-ink">
            Trip Confirmed
          </span>
        </div>
        <p className="text-xs text-muted font-mono mt-0.5">
          Undo available for <span className="font-bold text-cobalt text-sm tabular">{secondsRemaining}s</span>
        </p>
      </div>

      <button
        type="button"
        disabled={isUndoing}
        onClick={handleUndo}
        className="min-h-[44px] px-3.5 py-1.5 bg-danger text-white font-bold text-xs uppercase rounded-btn hover:bg-red-700 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger"
      >
        <UndoIcon size={16} />
        <span>{isUndoing ? 'Cancelling...' : 'Undo'}</span>
      </button>
    </aside>
  );
};
