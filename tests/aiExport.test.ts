import { describe, expect, it } from 'vitest';
import { buildAiExport } from '../src/services/aiExport';
import { createSession, submitAnswer } from '../src/services/practice';
import { defaultSettings } from '../src/services/settings';

describe('minimal AI export', () => {
  for (const mode of ['particle', 'usage', 'error', 'mixed'] as const) {
    it(`exports only the question, choices and selection for ${mode}`, () => {
      const session = createSession({ ...defaultSettings(), practiceMode: mode });
      session.questions.forEach((question, index) =>
        submitAnswer(
          session,
          index < 7
            ? question.correctAnswer
            : question.choices.find((choice) => choice !== question.correctAnswer)!,
        ),
      );
      const output = buildAiExport(session);
      const blocks = output.split('\n\n');
      expect(blocks).toHaveLength(10);
      session.answers.forEach(({ question, answer }, index) => {
        const label = (value: string) =>
          question.type === 'error' ? (value === '沒問題' ? '○' : '×') : value;
        const sentence =
          question.type === 'usage'
            ? question.example.sentenceWithBlank.replace(
                '（　）',
                `【${question.example.particle}】`,
              )
            : question.sentence;
        expect(blocks[index]!.split('\n')).toEqual([
          `${index + 1}. 題目：${sentence}`,
          `選項：${question.choices.map(label).join('／')}`,
          `我選：${label(answer)}`,
        ]);
      });
      expect(output).not.toMatch(
        /正確答案|正確句|總分|統計|課程|模式|音效|日文語音|請分析|目標助詞|用途：/,
      );
    });
  }
  it('retains the exact usage target without a legend', () => {
    const session = createSession({
      ...defaultSettings(),
      practiceMode: 'usage',
      selectedParticles: ['に'],
    });
    session.questions.forEach((question) => submitAnswer(session, question.correctAnswer));
    expect(buildAiExport(session)).toContain('前【に】');
  });
  it('rejects incomplete or empty sessions', () => {
    const session = createSession(defaultSettings());
    expect(() => buildAiExport(session)).toThrow('請先完成');
    session.questions = [];
    expect(() => buildAiExport(session)).toThrow('請先完成');
  });
});
