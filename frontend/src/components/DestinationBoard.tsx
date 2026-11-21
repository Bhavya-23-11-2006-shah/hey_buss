import React from 'react';
import { useStore } from '../store/useStore';

export const DestinationBoard: React.FC = () => {
  const destinationBoardText = useStore((state) => state.destinationBoardText);
  const profile = useStore((state) => state.profile);
  const isDeaf = profile.needs.includes('deaf');

  const isIdle =
    !destinationBoardText ||
    destinationBoardText === 'HEY BUSS - A BUS THAT IS READY FOR YOU';

  return (
    <section
      aria-label="Transit Destination Board and Live Speech Captions"
      className="w-full bg-ink border-b-4 border-ink shadow-hard-sm"
    >
      <div className="max-w-2xl mx-auto px-3 py-2 flex items-center gap-3">
        {/* Route status LED indicator badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 bg-[#262626] border border-[#FFDE00] rounded text-[12px] font-bold tracking-wider text-signal-yellow">
          <span className="w-2 h-2 rounded-full bg-signal-yellow animate-pulse" />
          <span>DESTINATION</span>
        </div>

        {/* The Matrix Display */}
        <div
          role="status"
          aria-live="polite"
          className="flex-1 overflow-hidden font-matrix text-signal-yellow text-[19px] sm:text-[21px] leading-tight tracking-wider"
        >
          {isIdle ? (
            <div className="animate-marquee whitespace-nowrap">
              ✦ HEY BUSS - A BUS THAT IS READY FOR YOU ✦ LIVE ACCESSIBLE TRANSIT DISPATCH ✦
            </div>
          ) : (
            <div className="flex items-center gap-2 py-0.5">
              <span className="text-white text-xs font-sans uppercase font-bold tracking-widest bg-[#333] px-1.5 py-0.5 rounded">
                VOICE
              </span>
              <span className="text-signal-yellow font-bold">
                {destinationBoardText}
              </span>
            </div>
          )}
        </div>

        {/* Deaf mode badge if enabled */}
        {isDeaf && (
          <div className="hidden sm:flex flex-shrink-0 px-2 py-0.5 bg-[#FFDE00] text-ink text-[11px] font-extrabold uppercase rounded">
            Captions ON
          </div>
        )}
      </div>
    </section>
  );
};
