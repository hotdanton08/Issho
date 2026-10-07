import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../src/data/examples';

const modes = [
  { label: '助詞用途', single: true },
  { label: '找錯', single: true },
  { label: '混合', single: true },
  { label: '混合', single: false },
];
for (const [width, height] of [
  [375, 667],
  [390, 844],
  [393, 852],
  [430, 932],
  [1280, 800],
]) {
  for (const mode of modes) {
    test(`${mode.label} ${mode.single ? 'one' : 'two'} particles fits ${width}x${height}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: width!, height: height! });
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('/');
      await page.getByRole('button', { name: '練習設定', exact: true }).click();
      if (mode.single) {
        await page.getByText('助詞', { exact: true }).click();
        await page.getByRole('button', { name: 'で', exact: true }).click();
      }
      await page.getByText('模式', { exact: true }).click();
      await page.getByRole('button', { name: mode.label, exact: true }).click();
      await page.getByRole('button', { name: '完成', exact: true }).click();
      await page.getByRole('button', { name: '開始', exact: true }).click();
      const seen = new Set<string>();
      const errorAnswers = new Set<string>();
      for (let index = 0; index < 10; index++) {
        await expect(page.locator('.question-count')).toHaveText(`${index + 1} / 10`);
        const heading = await page.getByRole('heading').innerText();
        const sentence = await page.locator('.question-sentence').innerText();
        const example = EXAMPLES.find((e) =>
          [e.correctSentence, e.sentenceWithBlank, e.wrongVariant!.sentence].includes(sentence),
        )!;
        expect(example).toBeTruthy();
        if (mode.single) expect(example.particle).toBe('に');
        let correct: string;
        if (heading === '這個助詞表示什麼？') {
          seen.add('usage');
          correct = example.usage;
          await expect(page.locator('.question-sentence mark')).toHaveText(example.particle);
        } else if (heading === '這句話的助詞對嗎？') {
          seen.add('error');
          correct = sentence === example.correctSentence ? '沒問題' : '有問題';
          errorAnswers.add(correct);
        } else {
          seen.add('particle');
          correct = example.particle;
        }
        const isError = heading === '這句話的助詞對嗎？';
        const options = isError
          ? ['沒問題', '有問題']
          : await page.locator('.answer-choices button').allTextContents();
        const answer = index < 7 ? correct : options.find((c) => c.trim() !== correct)!.trim();
        await page
          .getByRole('button', {
            name: isError ? (answer === '沒問題' ? '正確句子' : '錯誤句子') : answer,
            exact: true,
          })
          .click();
        await expect(page.getByRole('status')).toContainText(index < 7 ? '正確！' : '不對');
        if (isError) {
          await expect(page.locator('.feedback-answer .q-icon')).toHaveAttribute(
            'aria-label',
            correct === '沒問題' ? '正確句子' : '錯誤句子',
          );
          await expect(page.locator('.answer-choices')).not.toContainText('沒問題');
          await expect(page.locator('.answer-choices')).not.toContainText('有問題');
        } else await expect(page.locator('.feedback-answer')).toContainText(correct);
        await expect(page.locator('.answer-choices button:disabled')).toHaveCount(options.length);
        if (heading === '這句話的助詞對嗎？' && correct === '有問題') {
          await expect(page.locator('.feedback-correction')).toHaveText(
            `${example.wrongVariant!.wrongParticle} → ${example.particle}`,
          );
        }
        const button = await page.getByRole('button', { name: '繼續', exact: true }).boundingBox();
        expect(button!.y + button!.height).toBeLessThanOrEqual(height!);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await expect(page.getByRole('button', { name: '播放正確日文句子' })).toBeVisible();
        if (index === 7)
          await page.screenshot({
            path: `test-results/phase3-${mode.label}-${mode.single}-${width}x${height}.png`,
          });
        await page.getByRole('button', { name: '繼續', exact: true }).click();
      }
      await expect(page.locator('.completion-score')).toHaveText('7 / 10');
      if (mode.label === '混合') {
        expect(seen).toEqual(
          new Set(mode.single ? ['usage', 'error'] : ['particle', 'usage', 'error']),
        );
      }
      if (mode.label !== '助詞用途') expect(errorAnswers).toEqual(new Set(['沒問題', '有問題']));
      await page.getByRole('button', { name: '再來一組', exact: true }).click();
      await expect(page.locator('.question-count')).toHaveText('1 / 10');
      await expect(page.getByRole('status')).toHaveCount(0);
      await page.getByRole('button', { name: '離開練習' }).click();
      await expect(page.getByRole('button', { name: '開始', exact: true })).toBeEnabled();
      expect(errors).toEqual([]);
    });
  }
}
