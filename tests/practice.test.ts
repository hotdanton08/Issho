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
  it('rejects unsupported modes and invalid settings', () => {
    const settings = defaultSettings();
    settings.selectedParticles = ['に'];
    expect(practiceIssue(settings)).toBe('再選一個助詞');
    for (const mode of ['usage', 'error', 'mixed'] as const) {
      settings.practiceMode = mode;
      expect(() => createSession(settings)).toThrow('目前開放選助詞模式');
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
