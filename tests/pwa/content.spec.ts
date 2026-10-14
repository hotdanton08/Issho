import { expect, test } from '@playwright/test';
import { EXAMPLES } from '../../src/data/examples';
import { defaultSettings } from '../../src/services/settings';
import { PARTICLES } from '../../src/types/settings';

for (const [width, height, lesson] of [
  [375, 667, 1],
  [390, 844, 5],
  [393, 852, 6],
  [430, 932, 18],
] as const) {
  test(`audited lesson ${lesson} mixed practice fits ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const settings = {
      ...defaultSettings(),
      selectedLessons: [lesson],
      selectedParticles: [...PARTICLES],
      practiceMode: 'mixed',
      soundEnabled: false,
    };
    await page.addInitScript(
      (value) => localStorage.setItem('issho.settings.v1', JSON.stringify(value)),
      settings,
    );
    await page.goto('/');
    await page.getByRole('button', { name: '開始', exact: true }).click();
    const types = new Set<string>();
    for (let index = 0; index < 10; index++) {
      await expect(page.locator('.question-count')).toHaveText(`${index + 1} / 10`);
      const sentence = await page.locator('.question-sentence').innerText();
      const example = EXAMPLES.find(
        (item) =>
          item.lesson === lesson &&
          [item.correctSentence, item.sentenceWithBlank, item.wrongVariant?.sentence].includes(
            sentence,
          ),
      );
      expect(example).toBeDefined();
      const heading = await page.getByRole('heading', { level: 1 }).innerText();
      types.add(heading);
      const answer =
        heading === '這句話的助詞對嗎？'
          ? sentence === example!.correctSentence
            ? '正確句子'
            : '錯誤句子'
          : heading === '這個助詞表示什麼？'
            ? example!.usage
            : example!.particle;
      await page.getByRole('button', { name: answer, exact: true }).click();
      await expect(page.getByRole('status')).toContainText('正確！');
      const next = await page.getByRole('button', { name: '繼續', exact: true }).boundingBox();
      expect(next!.y + next!.height).toBeLessThanOrEqual(height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.getByRole('button', { name: '繼續', exact: true }).click();
    }
    expect(types.size).toBe(3);
    await expect(page.locator('.completion-score')).toHaveText('10 / 10');
    await expect(page.getByRole('button', { name: '複製結果', exact: true })).toBeInViewport();
  });
}
