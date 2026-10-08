import { onUnmounted, ref } from 'vue';
import { buildAiExport } from '../services/aiExport';
import type { PracticeSession } from '../types/practice';

export function useAiCopy(session: () => PracticeSession | null, finished: () => boolean) {
  const copying = ref(false);
  const copied = ref(false);
  const copyError = ref('');
  const manualText = ref('');
  let generation = 0;
  function resetCopy() {
    generation++;
    copying.value = false;
    copied.value = false;
    copyError.value = '';
    manualText.value = '';
  }
  onUnmounted(resetCopy);

  async function copyForAi() {
    const current = session();
    if (!current || !finished() || copying.value) return;
    const text = buildAiExport(current);
    const attempt = ++generation;
    copying.value = true;
    copied.value = false;
    copyError.value = '';
    manualText.value = '';
    try {
      if (typeof navigator.clipboard?.writeText !== 'function')
        throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (generation === attempt) copied.value = true;
    } catch {
      if (generation === attempt) {
        copyError.value = '無法自動複製，請重試或全選下方文字複製';
        manualText.value = text;
      }
    } finally {
      if (generation === attempt) copying.value = false;
    }
  }
  return { copying, copied, copyError, manualText, copyForAi, resetCopy };
}
