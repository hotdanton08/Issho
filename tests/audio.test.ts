import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPracticeAudio } from '../src/services/audio';

afterEach(() => vi.unstubAllGlobals());

function speechDevice() {
  const synth = {
    getVoices: vi.fn(() => [] as SpeechSynthesisVoice[]),
    cancel: vi.fn(),
    speak: vi.fn<(speech: SpeechSynthesisUtterance) => void>(),
    paused: false,
    resume: vi.fn(),
  };
  class Utterance {
    lang = '';
    voice: SpeechSynthesisVoice | null = null;
    onend: (() => void) | null = null;
    onerror: ((event: { error: string }) => void) | null = null;
    constructor(public text: string) {}
  }
  vi.stubGlobal('window', { speechSynthesis: synth, SpeechSynthesisUtterance: Utterance });
  return { synth };
}

describe('practice audio', () => {
  it('handles unavailable audio and speech without breaking practice', () => {
    vi.stubGlobal('window', {});
    const failure = vi.fn();
    const audio = createPracticeAudio(failure);
    expect(audio.speechSupported).toBe(false);
    audio.playEffect('correct');
    audio.speak('寝る前に窓を閉めます。');
    audio.dispose();
    expect(failure).not.toHaveBeenCalled();
  });

  it('uses ja-JP, refreshes voices on replay and cancels the previous sentence', () => {
    const { synth } = speechDevice();
    const audio = createPracticeAudio(vi.fn());
    audio.speak('寝る前に窓を閉めます。');
    expect(synth.speak.mock.calls[0]?.[0]).toMatchObject({
      lang: 'ja-JP',
      text: '寝る前に窓を閉めます。',
      voice: null,
    });
    const japanese = { lang: 'ja-JP' } as SpeechSynthesisVoice;
    synth.getVoices.mockReturnValue([japanese]);
    audio.speak('寝る前に窓を閉めます。');
    expect(synth.speak.mock.calls[1]?.[0]).toMatchObject({ voice: japanese });
    expect(synth.cancel).toHaveBeenCalledTimes(2);
  });

  it('reports active playback errors but ignores canceled and obsolete speech', () => {
    const { synth } = speechDevice();
    const failure = vi.fn();
    const audio = createPracticeAudio(failure);
    audio.speak('正しい文。');
    const oldSpeech = synth.speak.mock.calls[0]?.[0] as SpeechSynthesisUtterance;
    audio.speak('次の文。');
    oldSpeech.onerror?.({ error: 'network' } as SpeechSynthesisErrorEvent);
    expect(failure).not.toHaveBeenCalled();
    const active = synth.speak.mock.calls[1]?.[0] as SpeechSynthesisUtterance;
    active.onerror?.({ error: 'language-unavailable' } as SpeechSynthesisErrorEvent);
    expect(failure).toHaveBeenCalledTimes(1);
    audio.speak('正しい文。');
    const canceled = synth.speak.mock.calls[2]?.[0] as SpeechSynthesisUtterance;
    audio.stop();
    canceled.onerror?.({ error: 'canceled' } as SpeechSynthesisErrorEvent);
    expect(failure).toHaveBeenCalledTimes(1);
  });

  it('does not start queued sound after leaving while AudioContext resumes', async () => {
    let resume: () => void = () => {};
    const createOscillator = vi.fn();
    const close = vi.fn(async () => {});
    class Context {
      state = 'suspended';
      createOscillator = createOscillator;
      close = close;
      resume() {
        return new Promise<void>((resolve) => {
          resume = () => {
            this.state = 'running';
            resolve();
          };
        });
      }
    }
    vi.stubGlobal('window', { AudioContext: Context });
    const audio = createPracticeAudio(vi.fn());
    audio.playEffect('correct');
    audio.dispose();
    resume();
    await Promise.resolve();
    expect(createOscillator).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
