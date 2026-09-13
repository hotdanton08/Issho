export const PARTICLES = [
  'は',
  'が',
  'を',
  'に',
  'で',
  'へ',
  'と',
  'も',
  'の',
  'から',
  'まで',
] as const;
export type Particle = (typeof PARTICLES)[number];
export const MODES = [
  { value: 'particle', label: '選助詞', icon: 'touch_app' },
  { value: 'usage', label: '助詞用途', icon: 'lightbulb_outline' },
  { value: 'error', label: '找錯', icon: 'search' },
  { value: 'mixed', label: '混合', icon: 'shuffle' },
] as const;
export type PracticeMode = (typeof MODES)[number]['value'];
export interface Settings {
  selectedLessons: number[];
  selectedParticles: Particle[];
  practiceMode: PracticeMode;
  soundEnabled: boolean;
  japaneseSpeechEnabled: boolean;
}
