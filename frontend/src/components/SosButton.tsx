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
  const triggerScreenFlash = useStore((state) => state.triggerScreenFlash);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  const [isPressing, setIsPressing] = useState(false);
  const [remainingSec, setRemainingSec] = useState(2.0);
  const [sosSent, setSosSent] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);

  const pressStartRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const HOLD_DURATION_MS = 2000;

  const startHold = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (sosSent) return;

    setIsPressing(true);
    setRemainingSec(2.0);
    pressStartRef.current = Date.now();
    vibrateDevice(80);

    timerRef.current = window.setInterval(() => {
      if (!pressStartRef.current) return;
      const elapsed = Date.now() - pressStartRef.current;
      const rem = Math.max(0, (HOLD_DURATION_MS - elapsed) / 1000);
      setRemainingSec(Number(rem.toFixed(1)));

      if (elapsed >= HOLD_DURATION_MS) {
        cancelHold();
        triggerSos();
      }
    }, 50);
  };

  const cancelHold = () => {
    setIsPressing(false);
    setRemainingSec(2.0);
    pressStartRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const triggerSos = async () => {
    vibrateDevice([300, 150, 300, 150, 400]);
    triggerScreenFlash();

    let lat = 22.5657; // Default Kolkata coordinates
    let lng = 88.3433;

    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true,
          });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (err) {
        console.warn('Geolocation failed or denied, using fallback:', err);
      }
    }

    try {
      const bookingId = activeBooking?.id || 'emergency-direct';
      await apiClient.sendSos(bookingId, lat, lng);
      setSosSent(true);

      const msg =
        profile.language === 'hi'
          ? 'एसओएस चेतावनी सक्रिय! कंट्रोल रूम और कंडक्टर को आपकी स्थिति भेजी गई।'
          : 'EMERGENCY SOS ACTIVE! Control room and conductor alerted with your location.';

      setDestinationBoardText(msg);
      speakText(msg, profile.language);
    } catch (err) {
      setSosError('Could not send SOS. Please notify nearest staff.');
    }
  };

  useEffect(() => {
    return () => cancelHold();
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
        aria-label="Emergency SOS - Press and hold for 2 seconds to alert transit control"
        aria-pressed={isPressing}
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
                EMERGENCY SOS ACTIVE
              </h2>
            </div>
            <p className="text-base font-bold text-ink">
              Your GPS coordinates and assistance instructions have been transmitted to the
              central transit control room and your bus crew.
            </p>
            <div className="bg-surface border border-neutral-300 p-3 rounded text-xs font-mono space-y-1">
              <div>STATUS: CENTRAL DISPATCH NOTIFIED</div>
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
