import { describe, expect, it } from 'vitest';
import { usePractice } from '../src/composables/usePractice';
import { EXAMPLES } from '../src/data/examples';
import {
  createSession,
  eligibleExamples,
  practiceIssue,
  sessionScore,
  submitAnswer,
} from '../src/services/practice';
import { defaultSettings } from '../src/services/settings';

describe('Phase 2 practice', () => {
  it('uses ten unique original lesson 18 examples and only selected choices', () => {
    const session = createSession(defaultSettings());
    expect(session.questions).toHaveLength(10);
    expect(new Set(session.questions.map((q) => q.example.id)).size).toBe(10);
    for (const question of session.questions) {
      expect(question.example.lesson).toBe(18);
      expect(question.choices.sort()).toEqual(['で', 'に'].sort());
      expect(question.example.sentenceWithBlank.replace('（　）', question.example.particle)).toBe(
        question.example.correctSentence,
      );
    }
  });
  it('filters exact lessons, particles and valid distractors without falling back', () => {
    const settings = defaultSettings();
    const other = { ...EXAMPLES[0]!, id: 'other', lesson: 17 };
    expect(eligibleExamples(settings, [...EXAMPLES, other])).not.toContain(other);
    settings.selectedLessons = [17];
    expect(eligibleExamples(settings)).toEqual([]);
    expect(() => createSession(settings)).toThrow('目前有第 18 課');
    settings.selectedLessons = [16, 17, 18];
    expect(eligibleExamples(settings, [...EXAMPLES, other])).toHaveLength(11);
    settings.selectedParticles = ['に', 'を'];
    expect(eligibleExamples(settings)).toEqual([]);
  });
  it('allows single-particle usage, error and mixed while particle mode requires two', () => {
    const settings = defaultSettings();
    settings.selectedParticles = ['に'];
    expect(practiceIssue(settings)).toBe('再選一個助詞');
    for (const mode of ['usage', 'error', 'mixed'] as const) {
      settings.practiceMode = mode;
      expect(createSession(settings).questions).toHaveLength(10);
      expect(createSession(settings).questions.every((q) => q.type !== 'particle')).toBe(true);
    }
  });
  it('snapshots settings and repeats only eligible samples if a smaller pool is provided', () => {
    const settings = defaultSettings();
    const session = createSession(settings, [EXAMPLES[0]!]);
    settings.selectedLessons.push(1);
    settings.selectedParticles.push('を');
    expect(session.settings.selectedLessons).toEqual([18]);
    expect(session.settings.selectedParticles).toEqual(['に', 'で']);
    expect(session.questions).toHaveLength(10);
    expect(session.questions.every((q) => q.example.id === EXAMPLES[0]!.id)).toBe(true);
  });
  it('locks answers, scores accurately, waits for continue and resets sessions', () => {
    const practice = usePractice();
    practice.start(defaultSettings());
    practice.next();
    expect(practice.index.value).toBe(0);
    for (let index = 0; index < 10; index++) {
      const correct = practice.question.value!.example.particle;
      const choice = index < 7 ? correct : correct === 'に' ? 'で' : 'に';
      practice.answer(choice);
      practice.answer(correct);
      expect(practice.session.value!.answers).toHaveLength(index + 1);
      expect(practice.index.value).toBe(index);
      practice.next();
    }
    expect(practice.finished.value).toBe(true);
    expect(practice.score.value).toBe(7);
    expect(practice.progress.value).toBe(1);
    practice.start(defaultSettings());
    expect(practice.score.value).toBe(0);
    expect(practice.finished.value).toBe(false);
    practice.leave();
    expect(practice.session.value).toBeNull();
  });
  it('rejects invalid options and submissions after the last answer', () => {
    const session = createSession(defaultSettings());
    expect(submitAnswer(session, 'を')).toBe(false);
    for (const question of session.questions) submitAnswer(session, question.example.particle);
    expect(sessionScore(session)).toBe(10);
    expect(submitAnswer(session, 'に')).toBe(false);
  });
});

// Phase 3 invariants: exact filters, all required types, correct/incorrect sentences,
// and scoring by the question's answer rather than always by its particle.
describe('Phase 3 exercise engine', () => {
  it('builds every supported mode with exact lesson and target-particle filtering', () => {
    for (const practiceMode of ['particle', 'usage', 'error', 'mixed'] as const) {
      const settings = { ...defaultSettings(), practiceMode };
      const outside = { ...EXAMPLES[0]!, lesson: 17, id: 'outside' };
      const session = createSession(settings, [...EXAMPLES, outside]);
      expect(session.questions).toHaveLength(10);
      expect(session.questions.every((q) => q.example.lesson === 18)).toBe(true);
      if (practiceMode !== 'mixed')
        expect(new Set(session.questions.map((q) => q.type))).toEqual(new Set([practiceMode]));
      expect(new Set(session.questions.map((q) => q.example.id)).size).toBe(10);
      settings.selectedLessons = [17];
      expect(() => createSession(settings)).toThrow();
    }
  });
  it('mixed guarantees all three types with multiple particles and only two with one', () => {
    for (let seed = 0; seed < 30; seed++) {
      const random = () => ((seed * 37 + 11) % 100) / 100;
      const settings = { ...defaultSettings(), practiceMode: 'mixed' as const };
      const multiple = createSession(settings, EXAMPLES, random);
      expect(new Set(multiple.questions.map((q) => q.type))).toEqual(
        new Set(['particle', 'usage', 'error']),
      );
      settings.selectedParticles = ['に'];
      const single = createSession(settings, EXAMPLES, random);
      expect(new Set(single.questions.map((q) => q.type))).toEqual(new Set(['usage', 'error']));
      expect(single.questions.every((q) => q.example.particle === 'に')).toBe(true);
      const errorAnswers = single.questions
        .filter((q) => q.type === 'error')
        .map((q) => q.correctAnswer);
      expect(new Set(errorAnswers)).toEqual(new Set(['沒問題', '有問題']));
    }
  });
  it('error mode contains five correct and five incorrect sentences even with one particle', () => {
    const settings = {
      ...defaultSettings(),
      practiceMode: 'error' as const,
      selectedParticles: ['に' as const],
    };
    const session = createSession(settings);
    expect(session.questions.filter((q) => q.correctAnswer === '沒問題')).toHaveLength(5);
    expect(session.questions.filter((q) => q.correctAnswer === '有問題')).toHaveLength(5);
    for (const q of session.questions) {
      expect(q.sentence).toBe(
        q.correctAnswer === '有問題' ? q.example.wrongVariant!.sentence : q.example.correctSentence,
      );
      expect(q.example.audioText).toBe(q.example.correctSentence);
    }
  });
  it('usage highlights the exact target and answers with a usage label', () => {
    const session = createSession({ ...defaultSettings(), practiceMode: 'usage' });
    for (const q of session.questions) {
      expect(q.sentence).toBe(q.example.correctSentence);
      expect(q.correctAnswer).toBe(q.example.usage);
      expect(q.choices).toHaveLength(4);
      expect(q.choices).toContain(q.correctAnswer);
      expect(submitAnswer(session, q.example.particle)).toBe(false);
      expect(submitAnswer(session, q.correctAnswer)).toBe(true);
    }
    expect(sessionScore(session)).toBe(10);
  });
  it('scores and locks answers for each mode, including wrong answers', () => {
    for (const practiceMode of ['usage', 'error', 'mixed'] as const) {
      const practice = usePractice();
      practice.start({ ...defaultSettings(), practiceMode });
      for (let i = 0; i < 10; i++) {
        const q = practice.question.value!;
        const choice = i < 6 ? q.correctAnswer : q.choices.find((c) => c !== q.correctAnswer)!;
        practice.answer(choice);
        practice.answer(q.correctAnswer);
        expect(practice.session.value!.answers).toHaveLength(i + 1);
        expect(practice.feedback.value!.correct).toBe(i < 6);
        practice.next();
      }
      expect(practice.finished.value).toBe(true);
      expect(practice.score.value).toBe(6);
    }
  });
  it('rejects incomplete content instead of silently dropping a required mixed type', () => {
    const settings = { ...defaultSettings(), practiceMode: 'mixed' as const };
    const noWrong = EXAMPLES.map((e) => {
      const sample = { ...e };
      delete sample.wrongVariant;
      return sample;
    });
    expect(() => createSession(settings, noWrong)).toThrow();
    const noUsage = EXAMPLES.map((e) => ({ ...e, usageChoices: [e.usage] }));
    expect(() => createSession(settings, noUsage)).toThrow();
  });
});

describe('lesson 18 sample scope', () => {
  it('single ni usage keeps the original before-action target instead of adding other usages', () => {
    const settings = {
      ...defaultSettings(),
      practiceMode: 'usage' as const,
      selectedParticles: ['に' as const],
    };
    const session = createSession(settings);
    expect(new Set(session.questions.map((q) => q.correctAnswer))).toEqual(new Set(['時間點']));
    expect(
      session.questions.every((q) => q.example.lesson === 18 && q.example.particle === 'に'),
    ).toBe(true);
    for (const q of session.questions) {
      expect(q.example.sentenceWithBlank).toContain('前（　）');
      expect(q.choices).toContain(q.correctAnswer);
      const parts = q.example.sentenceWithBlank.split('（　）');
      expect(`${parts[0]}に${parts[1]}`).toBe(q.sentence);
    }
  });
});
