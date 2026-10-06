import type { Particle, Settings } from './settings';

export interface ParticleExample {
  id: string;
  lesson: number;
  correctSentence: string;
  sentenceWithBlank: string;
  particle: Particle;
  usage: string;
  distractorParticles: Particle[];
  usageChoices: string[];
  shortExplanation: string;
  audioText: string;
}
export interface ParticleQuestion {
  example: ParticleExample;
  type: 'particle';
  choices: Particle[];
}
export interface PracticeAnswer {
  question: ParticleQuestion;
  answer: Particle;
  correct: boolean;
}
export interface PracticeSession {
  settings: Settings;
  questions: ParticleQuestion[];
  answers: PracticeAnswer[];
}
