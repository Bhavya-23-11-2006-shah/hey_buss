import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../api/client';
import { speakText, vibrateDevice } from '../utils/speech';

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
  }, [bookingTimestamp, activeBooking]);

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
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 bg-ink text-white border-3 border-signal-yellow p-4 rounded shadow-hard-lg flex items-center justify-between gap-3 animate-bounce-subtle"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-signal-yellow animate-ping" />
          <span className="font-bold text-sm tracking-wide text-signal-yellow">
            TRIP CONFIRMED
          </span>
        </div>
        <p className="text-xs font-mono text-neutral-300">
          Undo available for <span className="font-bold text-white text-sm">{secondsRemaining}s</span>
        </p>
      </div>

      <button
        type="button"
        disabled={isUndoing}
        onClick={handleUndo}
        className="min-h-[46px] px-4 py-1.5 bg-signal-yellow text-ink font-black text-sm uppercase rounded border-2 border-ink hover:bg-yellow-300 active:translate-x-0.5 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white transition-all shadow-hard-sm"
      >
        {isUndoing ? 'Undoing...' : 'Undo Booking'}
      </button>
    </div>
  );
};
