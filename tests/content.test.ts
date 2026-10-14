import { describe, expect, it } from 'vitest';
import { CURRICULUM_TARGETS } from '../src/data/curriculum';
import type { CurriculumTargetId } from '../src/data/curriculum';
import { EXAMPLES } from '../src/data/examples';
import { createSession, eligibleExamples } from '../src/services/practice';
import { defaultSettings } from '../src/services/settings';
import { MODES, PARTICLES } from '../src/types/settings';

describe('audited first content batch', () => {
  it('has one target and blank per original example, with consistent correct and wrong variants', () => {
    expect(new Set(EXAMPLES.map((example) => example.id)).size).toBe(EXAMPLES.length);
    expect(new Set(EXAMPLES.map((example) => example.correctSentence)).size).toBe(EXAMPLES.length);
    for (const example of EXAMPLES) {
      const target = CURRICULUM_TARGETS[example.targetId as CurriculumTargetId];
      expect(target).toBeDefined();
      expect([example.lesson, example.particle, example.usage]).toEqual([
        target.lesson,
        target.particle,
        target.usage,
      ]);
      expect(example.sentenceWithBlank.split('（　）')).toHaveLength(2);
      expect(example.sentenceWithBlank.replace('（　）', example.particle)).toBe(
        example.correctSentence,
      );
      expect(example.audioText).toBe(example.correctSentence);
      expect(example.usageChoices).toContain(example.usage);
      expect(new Set(example.usageChoices).size).toBe(4);
      expect(example.distractorParticles).not.toContain(example.particle);
      expect(example.sentenceWithBlank.replace('（　）', example.wrongVariant!.wrongParticle)).toBe(
        example.wrongVariant!.sentence,
      );
    }
  });

  it('keeps each available lesson isolated in all four modes, and does not populate unfinished lessons', () => {
    const available = [1, 2, 3, 4, 5, 6, 18];
    for (const lesson of available) {
      for (const mode of MODES) {
        const settings = {
          ...defaultSettings(),
          selectedLessons: [lesson],
          selectedParticles: [...PARTICLES],
          practiceMode: mode.value,
        };
        const session = createSession(settings);
        expect(session.questions).toHaveLength(10);
        expect(session.questions.every((question) => question.example.lesson === lesson)).toBe(
          true,
        );
        if (mode.value === 'mixed')
          expect(new Set(session.questions.map((question) => question.type))).toEqual(
            new Set(['particle', 'usage', 'error']),
          );
      }
    }
    for (let lesson = 1; lesson <= 25; lesson++) {
      if (available.includes(lesson)) continue;
      const settings = {
        ...defaultSettings(),
        selectedLessons: [lesson],
        selectedParticles: [...PARTICLES],
      };
      expect(eligibleExamples(settings)).toEqual([]);
      expect(() => createSession(settings)).toThrow('沒有相符題目');
    }
  });

  it('distinguishes clock time from before-action ni and removes action-location de from lesson 18', () => {
    const settings = {
      ...defaultSettings(),
      selectedParticles: ['に'] as const,
      practiceMode: 'usage' as const,
    };
    const pool = (lesson: number) =>
      eligibleExamples({
        ...settings,
        selectedParticles: [...settings.selectedParticles],
        selectedLessons: [lesson],
      });
    expect(pool(4).every((example) => example.targetId === 'l04-ni-time')).toBe(true);
    expect(pool(18)).toHaveLength(10);
    expect(pool(18).every((example) => example.targetId === 'l18-ni-before')).toBe(true);
    expect(
      EXAMPLES.filter((example) => example.lesson === 18).some(
        (example) => example.particle === 'で',
      ),
    ).toBe(false);
    const de = EXAMPLES.filter((example) => example.targetId === 'l06-de-place');
    expect(de).toHaveLength(5);
    expect(de.every((example) => !example.correctSentence.includes('ことができます'))).toBe(true);
    expect(
      EXAMPLES.filter((example) => example.particle === 'へ').every(
        (example) => !example.distractorParticles.includes('に'),
      ),
    ).toBe(true);
  });
});
