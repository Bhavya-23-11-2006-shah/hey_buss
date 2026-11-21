import React from 'react';
import { useStore } from '../store/useStore';
import { speakText, vibrateDevice } from '../utils/speech';
import { SpeakerIcon } from './Icons';

const QUICK_PHRASES = [
  'Please wait for me',
  'I need the ramp',
  'Which stop is next?',
  'Please guide me to a priority seat',
];

export const DeafPhraseCards: React.FC = () => {
  const profile = useStore((state) => state.profile);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  const handleSpeakPhrase = (phrase: string) => {
    vibrateDevice([100, 50, 100]);
    setDestinationBoardText(`SPEAKING: "${phrase.toUpperCase()}"`);
    speakText(phrase, profile.language, () => {
      // Return board to standard text after speech
      setTimeout(() => {
        setDestinationBoardText('HEY BUSS - A BUS THAT IS READY FOR YOU');
      }, 3000);
    });
  };

  return (
    <section
      aria-label="Conductor Communication Phrases"
      className="bg-white border-3 border-ink rounded p-4 shadow-hard space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-serif font-bold text-ink">
          Conductor Phrase Cards
        </h2>
        <span className="text-xs font-mono font-bold bg-signal-yellow px-2 py-0.5 border border-ink rounded">
          Tap to Speak Aloud
        </span>
      </div>
      <p className="text-sm text-neutral-600">
        Tap any card below to speak your request clearly to the driver or conductor:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {QUICK_PHRASES.map((phrase) => (
          <button
            key={phrase}
            type="button"
            onClick={() => handleSpeakPhrase(phrase)}
            className="min-h-[52px] p-3 bg-paper border-2 border-ink rounded text-left font-bold text-base shadow-hard-sm hover:bg-signal-yellow active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-between gap-2 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink"
            aria-label={`Speak aloud to conductor: ${phrase}`}
          >
            <span>{phrase}</span>
            <span className="p-1 bg-white border border-ink rounded flex-shrink-0">
              <SpeakerIcon size={16} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
