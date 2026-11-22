import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useStore } from '../store/useStore';
import { vibrateDevice, speakText } from '../utils/speech';


interface SosButtonProps {
  floating?: boolean;
}

export const SosButton: React.FC<SosButtonProps> = ({ floating = true }) => {
  const activeBooking = useStore((state) => state.activeBooking);
  const profile = useStore((state) => state.profile);
  const shareLocationForSos = useStore((state) => state.shareLocationForSos);
  const triggerScreenFlash = useStore((state) => state.triggerScreenFlash);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  const [isPressing, setIsPressing] = useState(false);
  const [remainingSec, setRemainingSec] = useState(2.0);
  const [sosSent, setSosSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sosMocked, setSosMocked] = useState(false);
  const [locationAvailable, setLocationAvailable] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);

  const elapsedMsRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const HOLD_DURATION_MS = 2000;

  const startHold = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (sosSent || isSending || timerRef.current !== null) return;

    setIsPressing(true);
    setRemainingSec(2.0);
    setSosError(null);
    elapsedMsRef.current = 0;
    vibrateDevice(80);

    timerRef.current = window.setInterval(() => {
      elapsedMsRef.current += 50;
      const rem = Math.max(0, (HOLD_DURATION_MS - elapsedMsRef.current) / 1000);
      setRemainingSec(Number(rem.toFixed(1)));

      if (elapsedMsRef.current >= HOLD_DURATION_MS) {
        cancelHold();
        triggerSos();
      }
    }, 50);
  };

  const cancelHold = () => {
    setIsPressing(false);
    setRemainingSec(2.0);
    elapsedMsRef.current = 0;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const triggerSos = async () => {
    setIsSending(true);
    vibrateDevice([300, 150, 300, 150, 400]);
    triggerScreenFlash();

    let lat: number | null = null;
    let lng: number | null = null;

    if (shareLocationForSos && 'geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true,
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch {
        // Send the alert without coordinates rather than reporting a false location.
      }
    }

    try {
      const result = await apiClient.sendSos(activeBooking?.id, lat, lng, profile);
      setSosMocked(result.mocked);
      setLocationAvailable(result.locationAvailable);
      setSosSent(true);

      const msg = result.mocked
        ? 'This is a local demo alert. No real staff or emergency service was contacted.'
        : result.locationAvailable
          ? 'SOS alert posted to the connected Hey Buss staff dashboard.'
          : 'SOS alert posted. Device location was unavailable.';

      setDestinationBoardText(msg);
      speakText(msg, profile.language);
    } catch {
      setSosError('Hey Buss could not confirm the alert. Contact local emergency services directly.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      elapsedMsRef.current = 0;
    };
  }, []);

  const buttonElement = (
    <div className="relative inline-block select-none">
      <button
        type="button"
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            if (!isPressing) startHold(e);
          }
        }}
        onKeyUp={cancelHold}
        className={`relative min-h-[48px] px-4 py-2 rounded-full font-black text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 border-2 border-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger ${
          isPressing ? 'bg-red-700 ring-4 ring-red-300' : 'bg-danger hover:bg-red-700'
        }`}
        style={{ backgroundColor: '#E5213B' }}
        aria-label="Emergency SOS - Press and hold for 2 seconds to raise an alert"
        aria-pressed={isPressing}
        disabled={isSending || sosSent}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        <span className="tracking-wider text-base font-black uppercase">SOS</span>
        {isPressing && (
          <span className="text-xs bg-black/40 text-white px-2 py-0.5 rounded-full font-mono tabular">
            {remainingSec.toFixed(1)}s
          </span>
        )}
      </button>

      {/* Cancel button appears while pressing */}
      {isPressing && (
        <button
          type="button"
          onClick={cancelHold}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-ink text-xs font-bold px-2 py-0.5 rounded shadow border border-neutral-300 whitespace-nowrap"
          aria-label="Cancel SOS trigger"
        >
          Cancel
        </button>
      )}
    </div>
  );

  return (
    <>
      {floating ? (
        <aside
          aria-label="Emergency SOS trigger"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 pointer-events-auto"
        >
          {buttonElement}
        </aside>
      ) : (
        buttonElement
      )}

      {/* SOS Alert Modal/Banner */}
      {sosSent && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border-2 border-danger p-6 max-w-md w-full rounded-card shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-danger">
              <span className="w-4 h-4 rounded-full bg-danger animate-ping" />
              <h2 className="text-2xl font-black text-danger">
                {sosMocked ? 'DEMO ALERT ONLY' : 'SOS ALERT RAISED'}
              </h2>
            </div>
            <p className="text-base font-bold text-ink">
              {sosMocked
                ? 'This local demo alert was not sent to staff or emergency services.'
                : 'The alert was posted to the connected Hey Buss staff dashboard. It does not contact emergency services automatically.'}
            </p>
            {!locationAvailable && !sosMocked && (
              <p className="text-sm font-semibold text-ink">Your device location was unavailable, so no coordinates were included.</p>
            )}
            <p className="text-sm text-muted">For immediate danger, contact local emergency services directly.</p>
            <div className="bg-surface border border-neutral-300 p-3 rounded text-xs font-mono space-y-1">
              <div>STATUS: {sosMocked ? 'LOCAL DEMO ONLY' : 'HEY BUSS DASHBOARD ALERT'}</div>
              <div>PASSENGER: {profile.name}</div>
              <div>ASSISTANCE: {profile.howToHelp.join(', ') || 'General Assistance'}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSosSent(false);
                setDestinationBoardText('HEY BUSS - A BUS THAT IS READY FOR YOU');
              }}
              className="btn btn-primary w-full text-base font-black"
            >
              Dismiss Alarm
            </button>
          </div>
        </div>
      )}

      {sosError && (
        <div role="alert" className="fixed bottom-4 right-4 bg-danger text-white p-3 rounded font-bold shadow-lg z-50">
          {sosError}
        </div>
      )}
    </>
  );
};
