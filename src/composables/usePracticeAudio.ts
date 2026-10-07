import { computed, onUnmounted, ref, watch } from 'vue';
import { createPracticeAudio, type PracticeSound } from '../services/audio';
import type { Settings } from '../types/settings';

export function usePracticeAudio(settings: () => Settings) {
  const speechError = ref('');
  const audio = createPracticeAudio(() => {
    speechError.value = '暫時無法播放，請再試一次';
  });
  const speechEnabled = computed(() => settings().japaneseSpeechEnabled);
  watch(speechEnabled, (enabled) => {
    if (!enabled) audio.stopSpeech();
  });
  watch(
    () => settings().soundEnabled,
    (enabled) => {
      if (!enabled) audio.stopEffects();
    },
  );
  onUnmounted(audio.dispose);

  function playEffect(sound: PracticeSound) {
    if (settings().soundEnabled) audio.playEffect(sound);
  }
  function playSentence(sentence: string) {
    if (!speechEnabled.value) return;
    speechError.value = '';
    audio.speak(sentence);
  }
  function stopAudio() {
    audio.stop();
    speechError.value = '';
  }
  return {
    speechEnabled,
    speechSupported: audio.speechSupported,
    speechError,
    playEffect,
    playSentence,
    stopAudio,
  };
}
