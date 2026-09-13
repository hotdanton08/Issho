import { MODES, PARTICLES } from '../types/settings';
import type { Settings } from '../types/settings';
export const STORAGE_KEY = 'issho.settings.v1';
export function defaultSettings(): Settings {
  return {
    selectedLessons: [18],
    selectedParticles: ['に', 'で'],
    practiceMode: 'particle',
    soundEnabled: true,
    japaneseSpeechEnabled: true,
  };
}
// Validate fields independently so outdated storage cannot break startup.
export function parseSettings(raw: string | null): Settings {
  const defaults = defaultSettings();
  if (!raw) return defaults;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return defaults;
    const value = data as Record<string, unknown>;
    const savedParticles = value.selectedParticles;
    return {
      selectedLessons: Array.isArray(value.selectedLessons)
        ? [
            ...new Set(
              value.selectedLessons.filter(
                (lesson): lesson is number =>
                  typeof lesson === 'number' &&
                  Number.isInteger(lesson) &&
                  lesson >= 1 &&
                  lesson <= 25,
              ),
            ),
          ].sort((a, b) => a - b)
        : defaults.selectedLessons,
      selectedParticles: Array.isArray(savedParticles)
        ? PARTICLES.filter((particle) => savedParticles.includes(particle))
        : defaults.selectedParticles,
      practiceMode:
        MODES.find((mode) => mode.value === value.practiceMode)?.value ?? defaults.practiceMode,
      soundEnabled:
        typeof value.soundEnabled === 'boolean' ? value.soundEnabled : defaults.soundEnabled,
      japaneseSpeechEnabled:
        typeof value.japaneseSpeechEnabled === 'boolean'
          ? value.japaneseSpeechEnabled
          : defaults.japaneseSpeechEnabled,
    };
  } catch {
    return defaults;
  }
}
export function settingsIssue(settings: Settings): string {
  if (!settings.selectedLessons.length) return '請選擇至少一課';
  if (!settings.selectedParticles.length) return '請選擇至少一個助詞';
  if (settings.practiceMode === 'particle' && settings.selectedParticles.length < 2)
    return '再選一個助詞';
  return '';
}
