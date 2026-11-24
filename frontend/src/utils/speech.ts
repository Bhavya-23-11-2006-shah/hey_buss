// SpeechSynthesis & Web Speech API Utilities for Hey Buss

export function speakText(text: string, language: 'en' | 'hi' = 'en', onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending utterance

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
  utterance.rate = 0.95; // Slightly measured for accessibility clarity
  utterance.pitch = 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

export function vibrateDevice(pattern: number | number[] = [120, 60, 120]) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors if blocked by permissions
    }
  }
}

// Check speech recognition support
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function createSpeechRecognizer(
  language: 'en' | 'hi',
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd?: () => void,
  continuous = false
) {
  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition not supported in this browser.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      let combined = '';
      for (let i = event.resultIndex || 0; i < event.results.length; i++) {
        if (!event.results[i].isFinal) continue;
        combined += event.results[i][0].transcript + ' ';
      }
      if (combined.trim()) onResult(combined.trim());
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      onError(event.error);
    };

    recognition.onend = () => {
      onEnd?.();
    };

    return recognition;
  } catch (err) {
    onError(String(err));
    return null;
  }
}

