import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { MODES, PARTICLES } from '../types/settings';
import type { Particle } from '../types/settings';
import { defaultSettings, parseSettings, settingsIssue, STORAGE_KEY } from '../services/settings';
export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(defaultSettings());
  const storageUnavailable = ref(false);
  try {
    settings.value = parseSettings(localStorage.getItem(STORAGE_KEY));
  } catch {
    storageUnavailable.value = true;
  }
  watch(
    settings,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        storageUnavailable.value = false;
      } catch {
        storageUnavailable.value = true;
      }
    },
    { deep: true, flush: 'sync' },
  );
  const lessonLabel = computed(() =>
    settings.value.selectedLessons.length
      ? `第 ${settings.value.selectedLessons.join('、')} 課`
      : '尚未選擇課程',
  );
  const particleLabel = computed(
    () => settings.value.selectedParticles.join('・') || '尚未選擇助詞',
  );
  const mode = computed(
    () => MODES.find((item) => item.value === settings.value.practiceMode) ?? MODES[0],
  );
  const issue = computed(() => settingsIssue(settings.value));
  function toggleLesson(lesson: number) {
    if (!Number.isInteger(lesson) || lesson < 1 || lesson > 25) return;
    const current = settings.value.selectedLessons;
    settings.value.selectedLessons = current.includes(lesson)
      ? current.filter((item) => item !== lesson)
      : [...current, lesson].sort((a, b) => a - b);
  }
  function toggleParticle(particle: Particle) {
    const current = settings.value.selectedParticles;
    settings.value.selectedParticles = current.includes(particle)
      ? current.filter((item) => item !== particle)
      : PARTICLES.filter((item) => item === particle || current.includes(item));
  }
  return {
    settings,
    storageUnavailable,
    lessonLabel,
    particleLabel,
    mode,
    issue,
    toggleLesson,
    toggleParticle,
  };
});
