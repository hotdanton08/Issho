import { EXAMPLES } from '../data/examples';
import { settingsIssue } from './settings';
import type { Settings } from '../types/settings';
import type {
  ParticleExample,
  PracticeQuestion,
  PracticeSession,
  QuestionType,
} from '../types/practice';

export const SESSION_LENGTH = 10;
export const ERROR_CHOICES = ['沒問題', '有問題'] as const;

export function questionTypes(settings: Settings): QuestionType[] {
  if (settings.practiceMode !== 'mixed') return [settings.practiceMode];
  return settings.selectedParticles.length >= 2
    ? ['particle', 'usage', 'error']
    : ['usage', 'error'];
}

function supportsType(example: ParticleExample, settings: Settings, type: QuestionType): boolean {
  if (type === 'particle')
    return example.distractorParticles.some((p) => settings.selectedParticles.includes(p));
  if (type === 'usage')
    return example.usageChoices.includes(example.usage) && new Set(example.usageChoices).size >= 2;
  return !!example.wrongVariant && example.wrongVariant.sentence !== example.correctSentence;
}

export function eligibleExamples(
  settings: Settings,
  examples = EXAMPLES,
  type?: QuestionType,
): ParticleExample[] {
  const types = type ? [type] : questionTypes(settings);
  return examples.filter(
    (example) =>
      settings.selectedLessons.includes(example.lesson) &&
      settings.selectedParticles.includes(example.particle) &&
      types.some((candidate) => supportsType(example, settings, candidate)),
  );
}

export function practiceIssue(settings: Settings, examples = EXAMPLES): string {
  const issue = settingsIssue(settings);
  if (issue) return issue;
  if (questionTypes(settings).some((type) => !eligibleExamples(settings, examples, type).length))
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

// One example supplies every question type; the chosen answer is explicit for scoring/export.
export function toQuestion(
  example: ParticleExample,
  type: QuestionType,
  settings: Settings,
  showWrong = false,
  random: () => number = Math.random,
): PracticeQuestion {
  if (type === 'particle')
    return {
      example,
      type,
      sentence: example.sentenceWithBlank,
      correctAnswer: example.particle,
      choices: shuffle(
        [
          ...new Set([
            example.particle,
            ...example.distractorParticles.filter((p) => settings.selectedParticles.includes(p)),
          ]),
        ],
        random,
      ),
    };
  if (type === 'usage')
    return {
      example,
      type,
      sentence: example.correctSentence,
      correctAnswer: example.usage,
      choices: shuffle([...new Set(example.usageChoices)], random),
    };
  if (!example.wrongVariant) throw new Error('找錯題缺少已審核的錯誤句');
  return {
    example,
    type,
    sentence: showWrong ? example.wrongVariant.sentence : example.correctSentence,
    correctAnswer: showWrong ? ERROR_CHOICES[1] : ERROR_CHOICES[0],
    choices: [...ERROR_CHOICES],
  };
}

export function createSession(
  settings: Settings,
  examples = EXAMPLES,
  random: () => number = Math.random,
): PracticeSession {
  const issue = practiceIssue(settings, examples);
  if (issue) throw new Error(issue);
  const types = shuffle(questionTypes(settings), random);
  // Simple balanced cycle, shuffled as a whole: all required types appear in every session.
  const schedule = shuffle(
    Array.from({ length: SESSION_LENGTH }, (_, i) => types[i % types.length]!),
    random,
  );
  const used = new Set<string>();
  let errorIndex = 0;
  const firstWrong = random() < 0.5;
  const questions = schedule.map((type) => {
    const pool = eligibleExamples(settings, examples, type);
    let candidates = pool.filter((example) => !used.has(example.id));
    if (!candidates.length) candidates = pool;
    const example = shuffle(candidates, random)[0]!;
    used.add(example.id);
    const showWrong = type === 'error' && (errorIndex++ % 2 === 0 ? firstWrong : !firstWrong);
    return toQuestion(example, type, settings, showWrong, random);
  });
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

export function submitAnswer(session: PracticeSession, answer: string): boolean {
  const question = session.questions[session.answers.length];
  if (!question || !question.choices.includes(answer)) return false;
  session.answers.push({ question, answer, correct: question.correctAnswer === answer });
  return true;
}

export function sessionScore(session: PracticeSession): number {
  return session.answers.filter((answer) => answer.correct).length;
}
