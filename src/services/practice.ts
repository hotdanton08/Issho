import { EXAMPLES } from '../data/examples';
import { settingsIssue } from './settings';
import type { Particle, Settings } from '../types/settings';
import type { ParticleExample, ParticleQuestion, PracticeSession } from '../types/practice';

export const SESSION_LENGTH = 10;

export function eligibleExamples(settings: Settings, examples = EXAMPLES): ParticleExample[] {
  return examples.filter(
    (example) =>
      settings.selectedLessons.includes(example.lesson) &&
      settings.selectedParticles.includes(example.particle) &&
      example.distractorParticles.some((particle) => settings.selectedParticles.includes(particle)),
  );
}

export function practiceIssue(settings: Settings, examples = EXAMPLES): string {
  const issue = settingsIssue(settings);
  if (issue) return issue;
  if (settings.practiceMode !== 'particle') return '目前開放選助詞模式';
  if (!eligibleExamples(settings, examples).length)
    return '目前有第 18 課的 に・で 題目，請調整設定';
  return '';
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other]!, result[index]!];
  }
  return result;
}

export function createSession(
  settings: Settings,
  examples = EXAMPLES,
  random: () => number = Math.random,
): PracticeSession {
  const issue = practiceIssue(settings, examples);
  if (issue) throw new Error(issue);
  const pool = eligibleExamples(settings, examples);
  const questions: ParticleQuestion[] = [];
  while (questions.length < SESSION_LENGTH) {
    for (const example of shuffle(pool, random)) {
      if (questions.length === SESSION_LENGTH) break;
      questions.push({
        example,
        type: 'particle',
        choices: shuffle(
          [
            example.particle,
            ...example.distractorParticles.filter((p) => settings.selectedParticles.includes(p)),
          ],
          random,
        ),
      });
    }
  }
  return {
    settings: {
      ...settings,
      selectedLessons: [...settings.selectedLessons],
      selectedParticles: [...settings.selectedParticles],
    },
    questions,
    answers: [],
  };
}

export function submitAnswer(session: PracticeSession, answer: Particle): boolean {
  const question = session.questions[session.answers.length];
  if (!question || !question.choices.includes(answer)) return false;
  session.answers.push({ question, answer, correct: question.example.particle === answer });
  return true;
}

export function sessionScore(session: PracticeSession): number {
  return session.answers.filter((answer) => answer.correct).length;
}
