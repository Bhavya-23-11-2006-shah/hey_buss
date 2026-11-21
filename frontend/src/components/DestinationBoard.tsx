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
      className="w-full dest-board py-2 border-b border-black/20"
      style={{ backgroundColor: '#0B1330' }}
    >
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-3">
        {/* Route status LED indicator badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-marigold/40 rounded text-[11px] font-bold tracking-wider text-marigold">
          <span className="w-2 h-2 rounded-full bg-marigold animate-pulse" />
          <span>LIVE BOARD</span>
        </div>

        {/* Caption Display */}
        <div
          role="status"
          aria-live="polite"
          className="flex-1 overflow-hidden text-marigold text-xs sm:text-sm font-bold tracking-wider"
        >
          {isIdle ? (
            <div className="animate-marquee whitespace-nowrap">
              HEY BUSS • ACCESSIBLE TRANSIT DEMO • VOICE ASSISTANT ACTIVE •
            </div>
          ) : (
            <div className="flex items-center gap-2 py-0.5 truncate">
              <span className="text-white text-[10px] font-mono uppercase font-bold tracking-widest bg-white/20 px-1.5 py-0.5 rounded">
                CAPTIONS
              </span>
              <span className="text-marigold truncate">
                {destinationBoardText}
              </span>
            </div>
          )}
        </div>

        {/* Deaf mode badge if enabled */}
        {isDeaf && (
          <div className="hidden sm:flex flex-shrink-0 px-2 py-0.5 bg-marigold text-ink text-[10px] font-black uppercase rounded">
            Captions ON
          </div>
        )}
      </div>
    </section>
  );
};
