import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useStore } from '../store/useStore';
import { vibrateDevice, speakText } from '../utils/speech';

export const SosButton: React.FC = () => {
  const activeBooking = useStore((state) => state.activeBooking);
  const profile = useStore((state) => state.profile);
  const triggerScreenFlash = useStore((state) => state.triggerScreenFlash);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [sosSent, setSosSent] = useState(false);
  const [sosError, setSosError] = useState<string | null>(null);

  const pressStartRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const HOLD_DURATION_MS = 2000;

  const startHold = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (sosSent) return;

    setIsPressing(true);
    setProgress(0);
    pressStartRef.current = Date.now();
    vibrateDevice(80);

    timerRef.current = window.setInterval(() => {
      if (!pressStartRef.current) return;
      const elapsed = Date.now() - pressStartRef.current;
      const pct = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));
      setProgress(pct);

      if (elapsed >= HOLD_DURATION_MS) {
        cancelHold();
        triggerSos();
      }
    }, 50);
  };

  const cancelHold = () => {
    setIsPressing(false);
    setProgress(0);
    pressStartRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const triggerSos = async () => {
    vibrateDevice([300, 150, 300, 150, 400]);
    triggerScreenFlash();

    let lat = 28.6139;
    let lng = 77.209;

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
        console.warn('Geolocation failed or denied, using stop fallback:', err);
      }
    }

    try {
      const bookingId = activeBooking?.id || 'emergency-direct';
      await apiClient.sendSos(bookingId, lat, lng);
      setSosSent(true);

      const msg =
        profile.language === 'hi'
          ? 'एसओएस चेतावनी भेजी गई! बस कंट्रोल और कंडक्टर को सूचित किया गया है।'
          : 'EMERGENCY SOS RAISED! Control room and conductor alerted with your location.';

      setDestinationBoardText(msg);
      speakText(msg, profile.language);
    } catch (err) {
      setSosError('Could not send SOS. Please notify nearest staff.');
    }
  };

  useEffect(() => {
    return () => cancelHold();
  }, []);

  return (
    <>
      <div className="relative inline-block">
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
          className={`relative min-h-[50px] px-4 py-2 border-3 border-ink rounded font-black text-white bg-sos-red shadow-hard active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink transition-all select-none flex items-center gap-2`}
          aria-label="Emergency SOS - Press and hold for 2 seconds to alert transit control"
          aria-pressed={isPressing}
        >
          <span className="w-3 h-3 rounded-full bg-white animate-ping" />
          <span className="tracking-wider text-base font-extrabold uppercase">SOS</span>
          {isPressing && (
            <span className="text-xs bg-ink text-white px-1.5 py-0.5 rounded font-mono">
              {Math.max(0, 2 - (progress / 100) * 2).toFixed(1)}s
            </span>
          )}
        </button>

        {/* Progress Bar under button while holding */}
        {isPressing && (
          <div className="absolute -bottom-2 left-0 right-0 h-2 bg-ink rounded-full overflow-hidden border border-white">
            <div
              className="h-full bg-signal-yellow transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* SOS Alert Modal/Banner */}
      {sosSent && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4"
        >
          <div className="bg-paper border-4 border-sos-red p-6 max-w-md w-full shadow-hard-lg rounded">
            <div className="flex items-center gap-3 text-sos-red mb-3">
              <span className="w-4 h-4 rounded-full bg-sos-red animate-ping" />
              <h2 className="text-2xl font-serif font-black text-sos-red">
                EMERGENCY SOS ACTIVE
              </h2>
            </div>
            <p className="text-lg font-bold text-ink mb-4">
              Your GPS coordinates and accessibility assistance profile have been transmitted to
              the central transit control room and your nearest bus conductor.
            </p>
            <div className="bg-white border-2 border-ink p-3 rounded mb-5 text-sm font-mono space-y-1">
              <div>STATUS: DISPATCH ALERTED</div>
              <div>PASSENGER: {profile.name}</div>
              <div>ASSISTANCE: {profile.howToHelp.join(', ') || 'General Transit Assistance'}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSosSent(false);
                setDestinationBoardText('HEY BUSS - A BUS THAT IS READY FOR YOU');
              }}
              className="w-full min-h-[56px] bg-ink text-white font-bold text-lg border-2 border-ink shadow-hard rounded hover:bg-neutral-800 focus-visible:ring-4 focus-visible:ring-ink"
            >
              Dismiss Alarm
            </button>
          </div>
        </div>
      )}

      {sosError && (
        <div role="alert" className="fixed bottom-4 right-4 bg-sos-red text-white p-3 border-2 border-ink rounded font-bold shadow-hard">
          {sosError}
        </div>
      )}
    </>
  );
};
