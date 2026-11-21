import React from 'react';
import { useStore } from '../store/useStore';
import { speakText, vibrateDevice } from '../utils/speech';
import { VolumeIcon } from './Icons';

const QUICK_PHRASES = [
  'Please lower the wheelchair ramp.',
  'Please wait for me to take my seat.',
  'Is this bus going to Salt Lake Sector V?',
  'Please guide me to the priority wheelchair bay.',
];

export const DeafPhraseCards: React.FC = () => {
  const profile = useStore((state) => state.profile);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  const handleSpeakPhrase = (phrase: string) => {
    vibrateDevice([100, 50, 100]);
    setDestinationBoardText(`SPEAKING: "${phrase.toUpperCase()}"`);
    speakText(phrase, profile.language, () => {
      setTimeout(() => {
        setDestinationBoardText('HEY BUSS - A BUS THAT IS READY FOR YOU');
      }, 3000);
    });
  };

  return (
    <section
      aria-label="Conductor Communication Phrases"
      className="card p-5 bg-white space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-ink">
          Conductor Phrase Cards
        </h3>
        <span className="text-[11px] font-mono font-bold bg-blue-50 text-cobalt px-2 py-0.5 border border-blue-200 rounded">
          Tap to Speak Aloud
        </span>
      </div>
      <p className="text-xs text-muted">
        Tap any phrase to announce your request aloud through your phone's speaker to the conductor:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {QUICK_PHRASES.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => handleSpeakPhrase(phrase)}
            className="min-h-[48px] p-3 bg-surface hover:bg-neutral-200 border border-neutral-300 rounded-btn text-left font-bold text-sm text-ink flex items-center justify-between gap-2 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cobalt"
            aria-label={`Speak aloud to conductor: ${phrase}`}
          >
            <span>{phrase}</span>
            <span className="p-1 rounded bg-white border border-neutral-300 text-cobalt flex-shrink-0">
              <VolumeIcon size={14} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
