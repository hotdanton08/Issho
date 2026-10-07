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
  wrongVariant?: { sentence: string; wrongParticle: Particle };
}
export type QuestionType = 'particle' | 'usage' | 'error';
export interface PracticeQuestion {
  example: ParticleExample;
  type: QuestionType;
  sentence: string;
  choices: string[];
  correctAnswer: string;
}
export interface PracticeAnswer {
  question: PracticeQuestion;
  answer: string;
  correct: boolean;
}
export interface PracticeSession {
  settings: Settings;
  questions: PracticeQuestion[];
  answers: PracticeAnswer[];
}
