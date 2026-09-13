import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
  defaultSettings,
  parseSettings,
  settingsIssue,
  STORAGE_KEY,
} from '../src/services/settings';
import { useSettingsStore } from '../src/stores/settings';

describe('settings persistence and validation', () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    setActivePinia(createPinia());
  });
  afterEach(() => vi.unstubAllGlobals());
  it('starts with a valid default and recovers malformed data', () => {
    for (const raw of [null, '{bad', 'null', '7'])
      expect(parseSettings(raw)).toEqual(defaultSettings());
    expect(settingsIssue(defaultSettings())).toBe('');
  });
  it('sanitizes unknown values without expanding lesson ranges', () => {
    expect(
      parseSettings(
        JSON.stringify({
          selectedLessons: [18, 18, 0, 26, '3', 3],
          selectedParticles: ['に', 'に', 'invalid'],
          practiceMode: 'unknown',
          soundEnabled: false,
        }),
      ),
    ).toEqual({
      ...defaultSettings(),
      selectedLessons: [3, 18],
      selectedParticles: ['に'],
      soundEnabled: false,
    });
    expect(parseSettings(JSON.stringify({ selectedLessons: [18] })).selectedLessons).toEqual([18]);
  });
  it('persists non-contiguous lessons and all five preferences across a new store', () => {
    const store = useSettingsStore();
    store.toggleLesson(3);
    store.toggleLesson(5);
    store.toggleParticle('で');
    store.settings.practiceMode = 'usage';
    store.settings.soundEnabled = false;
    store.settings.japaneseSpeechEnabled = false;
    const expected = JSON.parse(JSON.stringify(store.settings));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(expected);
    setActivePinia(createPinia());
    expect(useSettingsStore().settings).toEqual(expected);
    expect(useSettingsStore().settings.selectedLessons).toEqual([3, 5, 18]);
  });
  it('handles empty selections and the one-particle mode rules', () => {
    const store = useSettingsStore();
    store.toggleParticle('で');
    expect(store.issue).toBe('再選一個助詞');
    for (const mode of ['usage', 'error', 'mixed'] as const) {
      store.settings.practiceMode = mode;
      expect(store.issue).toBe('');
    }
    store.toggleParticle('に');
    expect(store.issue).toBe('請選擇至少一個助詞');
    store.toggleLesson(18);
    expect(store.issue).toBe('請選擇至少一課');
    expect(parseSettings(JSON.stringify(store.settings)).selectedLessons).toEqual([]);
  });
  it('keeps the shell usable when storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    });
    const store = useSettingsStore();
    expect(store.settings).toEqual(defaultSettings());
    expect(() => store.toggleLesson(3)).not.toThrow();
    expect(store.storageUnavailable).toBe(true);
  });
});
