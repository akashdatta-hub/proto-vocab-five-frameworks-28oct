// English-only TTS utility
// Prefers Indian English (en-IN), falls back to en-GB/en-US

export type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  onend?: () => void;
  onerror?: (error: SpeechSynthesisErrorEvent) => void;
};

/**
 * Get the best available English voice.
 * Prefers Indian English (en-IN), falls back to any English voice.
 */
export function getEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis?.getVoices?.() || [];

  // Prefer Indian English by lang code
  const indianEnglish = voices.find((v) => v.lang?.toLowerCase?.().includes('en-in'));
  if (indianEnglish) return indianEnglish;

  // Prefer Indian English by name (fallback)
  const indianByName = voices.find((v) => /india/i.test(v.name || ''));
  if (indianByName) return indianByName;

  // Fallback to any English voice
  return voices.find((v) => v.lang?.toLowerCase?.().startsWith('en-')) || null;
}

/**
 * Speak text in English only.
 * Never call this with Telugu text.
 */
export function speakEnglish(text: string, opts: SpeakOptions = {}): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not available');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getEnglishVoice();

  if (voice) {
    utterance.voice = voice;
  }

  utterance.rate = opts.rate ?? 1;
  utterance.pitch = opts.pitch ?? 1;
  utterance.volume = opts.volume ?? 1;

  if (opts.onend) {
    utterance.onend = opts.onend;
  }

  if (opts.onerror) {
    utterance.onerror = opts.onerror;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech.
 */
export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Get the language code of the selected voice.
 * Useful for analytics logging.
 */
export function getVoiceLang(): string | null {
  const voice = getEnglishVoice();
  return voice?.lang || null;
}
