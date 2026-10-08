import type { PracticeSession, QuestionType } from '../types/practice';

function answerLabel(answer: string, type: QuestionType): string {
  if (type !== 'error') return answer;
  return answer === '沒問題' ? '○' : '×';
}

export function buildAiExport(session: PracticeSession): string {
  if (!session.questions.length || session.answers.length !== session.questions.length)
    throw new Error('請先完成本次練習');
  return session.answers
    .map(({ question, answer }, index) => {
      const { example, type } = question;
      const sentence =
        type === 'usage'
          ? example.sentenceWithBlank.replace('（　）', `【${example.particle}】`)
          : question.sentence;
      return [
        `${index + 1}. 題目：${sentence}`,
        `選項：${question.choices.map((choice) => answerLabel(choice, type)).join('／')}`,
        `我選：${answerLabel(answer, type)}`,
      ].join('\n');
    })
    .join('\n\n');
}
