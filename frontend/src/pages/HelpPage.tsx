import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { DeafPhraseCards } from '../components/DeafPhraseCards';
import { speakText, vibrateDevice } from '../utils/speech';
import {
  AlertIcon,
  VolumeIcon,
} from '../components/Icons';

export const HelpPage: React.FC = () => {
  const profile = useStore((state) => state.profile);
  const setDestinationBoardText = useStore((state) => state.setDestinationBoardText);

  // Type-to-speak text box
  const [customText, setCustomText] = useState('');

  const handleSpeakCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    vibrateDevice(60);
    speakText(customText.trim(), profile.language);
    setDestinationBoardText(`SPEAKING: "${customText.trim()}"`);
    setCustomText('');
  };

  const handleQuickSpeak = (phrase: string) => {
    vibrateDevice(50);
    speakText(phrase, profile.language);
    setDestinationBoardText(phrase);
  };

  // Quick phrase buttons for non-verbal / speech difficulty
  const quickPhrases = [
    'Please lower the wheelchair ramp.',
    'Is this bus going to Salt Lake Sector V?',
    'Please wait for me to take my seat.',
    'Which stop is next?',
    'I need assistance getting off at Howrah Station.',
  ];

  // FAQ list
  const faqs = [
    {
      q: 'How does the driver know I need assistance?',
      a: 'When you confirm a booking, your assistance profile is stored with the booking and can be viewed on the Hey Buss conductor page. This demo does not notify a real bus crew.',
    },
    {
      q: 'What if a bus arrives and it is too crowded?',
      a: 'Tap "Take the next one" on your tracking screen. Hey Buss checks the next available trip in this demo; if none is available, the booking is cancelled and its wheelchair bay is released.',
    },
    {
      q: 'How does the double-tap gesture work for Blind mode?',
      a: 'When Blind mode is selected in your profile, you can double-tap anywhere on the screen at any time to activate the microphone and speak your request hands-free.',
    },
    {
      q: 'What does the Emergency SOS button do?',
      a: 'Pressing and holding SOS for 2 seconds posts an alert to the connected Hey Buss server. This demo does not contact emergency services or a real transit control room. Location is included only when you allow browser location access.',
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      {/* Page explanation */}
      <div className="bg-surface border border-neutral-300 p-3 rounded-card text-xs text-muted flex items-center justify-between">
        <span>❓ <strong>Help:</strong> Accessibility support, tap-to-speak phrases, voice command cheat sheet, and emergency transit contacts.</span>
      </div>

      {/* Emergency Hotline Banner */}
      <section className="card p-5 bg-red-50 border-2 border-danger space-y-2" aria-label="Emergency transit support">
        <div className="flex items-center gap-2 text-danger font-bold text-base">
          <AlertIcon size={20} />
          <span>Emergency Services</span>
        </div>
        <p className="text-sm text-ink font-medium">
          For immediate danger, call the official emergency numbers. Hey Buss SOS is not an emergency service.
        </p>
        <div className="text-2xl font-black font-mono text-danger tabular">
          <a href="tel:112">112</a> / <a href="tel:100">100</a>
        </div>
        <a className="text-xs underline text-muted" href="https://kolkatapolice.gov.in/contact/" target="_blank" rel="noreferrer">
          Kolkata Police emergency contact details
        </a>
      </section>

      {/* Type-to-Speak (Communication Aid) */}
      <section className="card p-6 bg-white space-y-4" aria-labelledby="type-speak-heading">
        <div className="space-y-1">
          <h2 id="type-speak-heading" className="text-xl font-bold text-ink">
            Type-to-Speak Device
          </h2>
          <p className="text-sm text-muted">
            Type any sentence below and tap Speak to have your device say it out loud to the bus conductor.
          </p>
        </div>

        <form onSubmit={handleSpeakCustom} className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. Please let me know when Esplanade is approaching"
            className="input flex-1 font-medium"
            aria-label="Sentence to speak out loud"
          />
          <Button type="submit" variant="primary" leftIcon={<VolumeIcon size={18} />}>
            Speak
          </Button>
        </form>

        {/* Tap-to-Speak Preset Quick Phrases */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold uppercase text-muted tracking-wider block">
            Tap-to-Speak Quick Phrases:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPhrases.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickSpeak(phrase)}
                className="px-3 py-2 bg-surface hover:bg-neutral-200 border border-neutral-300 rounded-btn text-xs font-bold text-ink transition-colors flex items-center gap-1.5"
              >
                <VolumeIcon size={14} className="text-cobalt" />
                <span>{phrase}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Deaf Phrase Cards Component */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-ink">Visual Conductor Cards</h2>
        <DeafPhraseCards />
      </section>

      {/* Voice Assistant Cheat Sheet */}
      <section className="card p-6 bg-surface space-y-4" aria-labelledby="voice-commands-heading">
        <h2 id="voice-commands-heading" className="text-xl font-bold text-ink">
          Voice Assistant Phrases
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-white border border-neutral-300 rounded-btn space-y-1">
            <span className="font-bold text-cobalt">Booking</span>
            <p className="text-xs text-muted">“Find a bus from Esplanade to Salt Lake Sector V at 9am”</p>
          </div>
          <div className="p-3 bg-white border border-neutral-300 rounded-btn space-y-1">
            <span className="font-bold text-cobalt">Tracking</span>
            <p className="text-xs text-muted">“Where is my bus?”</p>
          </div>
          <div className="p-3 bg-white border border-neutral-300 rounded-btn space-y-1">
            <span className="font-bold text-cobalt">Crowd / Delay</span>
            <p className="text-xs text-muted">“Take the next accessible bus”</p>
          </div>
          <div className="p-3 bg-white border border-neutral-300 rounded-btn space-y-1">
            <span className="font-bold text-cobalt">Emergency</span>
            <p className="text-xs text-muted">“Emergency SOS”</p>
          </div>
        </div>
      </section>

      {/* Large-Text FAQ */}
      <section className="space-y-4" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="text-2xl font-bold text-ink">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card p-5 bg-white space-y-2">
              <h3 className="text-lg font-bold text-ink">{faq.q}</h3>
              <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
