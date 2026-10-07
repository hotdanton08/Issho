export type PracticeSound = 'correct' | 'incorrect' | 'complete';

const sounds: Record<
  PracticeSound,
  { notes: readonly number[]; spacing: number; duration: number }
> = {
  correct: { notes: [1175, 1568], spacing: 0.045, duration: 0.12 },
  incorrect: { notes: [440, 330], spacing: 0.035, duration: 0.1 },
  complete: { notes: [1047, 1319, 1568, 2093], spacing: 0.06, duration: 0.16 },
};

export function createPracticeAudio(onSpeechError: () => void) {
  const speechSupported =
    typeof window !== 'undefined' &&
    !!window.speechSynthesis &&
    typeof window.SpeechSynthesisUtterance === 'function';
  let context: AudioContext | null = null;
  let effectGeneration = 0;
  let currentSpeech: SpeechSynthesisUtterance | null = null;
  const oscillators = new Set<OscillatorNode>();

  function stopEffects() {
    effectGeneration++;
    for (const oscillator of oscillators) {
      oscillator.stop();
    }
    oscillators.clear();
  }

  function stopSpeech() {
    currentSpeech = null;
    if (speechSupported) window.speechSynthesis.cancel();
  }

  function stop() {
    stopEffects();
    stopSpeech();
  }

  async function scheduleEffect(sound: PracticeSound, generation: number) {
    if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') return;
    context ??= new window.AudioContext({ latencyHint: 'interactive' });
    const activeContext = context;
    if (activeContext.state === 'suspended') await activeContext.resume();
    if (generation !== effectGeneration || activeContext.state !== 'running') return;
    const start = activeContext.currentTime + 0.005;
    const { notes, spacing, duration } = sounds[sound];
    notes.forEach((frequency, index) => {
      const oscillator = activeContext.createOscillator();
      const gain = activeContext.createGain();
      const at = start + index * spacing;
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.24, at + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.001, at + duration - 0.005);
      oscillator.connect(gain);
      gain.connect(activeContext.destination);
      oscillators.add(oscillator);
      oscillator.onended = () => {
        oscillators.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      oscillator.start(at);
      oscillator.stop(at + duration);
    });
  }

  function playEffect(sound: PracticeSound) {
    stopEffects();
    // Audio is optional: a blocked or unavailable device must never interrupt practice.
    void scheduleEffect(sound, effectGeneration).catch(() => {});
  }

  function speak(sentence: string) {
    if (!speechSupported) return;
    stop();
    try {
      const speech = new window.SpeechSynthesisUtterance(sentence);
      speech.lang = 'ja-JP';
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice =
        voices.find((voice) => voice.lang.toLowerCase() === 'ja-jp') ??
        voices.find((voice) => /^ja(?:-|$)/i.test(voice.lang));
      if (japaneseVoice) speech.voice = japaneseVoice;
      currentSpeech = speech;
      speech.onend = () => {
        if (currentSpeech === speech) currentSpeech = null;
      };
      speech.onerror = (event) => {
        if (currentSpeech !== speech) return;
        currentSpeech = null;
        if (event.error !== 'canceled' && event.error !== 'interrupted') onSpeechError();
      };
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      window.speechSynthesis.speak(speech);
    } catch {
      currentSpeech = null;
      onSpeechError();
    }
  }

  function dispose() {
    stop();
    if (context) void context.close().catch(() => {});
    context = null;
  }

  return { speechSupported, playEffect, speak, stopEffects, stopSpeech, stop, dispose };
}
