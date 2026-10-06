import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [375, 667],
  [390, 844],
  [393, 852],
  [430, 932],
  [1280, 800],
]) {
  test(`ten-question practice fits ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width: width!, height: height! });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.getByRole('button', { name: '開始', exact: true }).click();
    for (let index = 0; index < 10; index++) {
      await expect(page.locator('.question-count')).toHaveText(`${index + 1} / 10`);
      await expect(page.getByRole('button', { name: /播放|語音/ })).toHaveCount(0);
      const sentence = await page.locator('.question-sentence').innerText();
      const correct = sentence.includes('前（') ? 'に' : 'で';
      const answer = index < 7 ? correct : correct === 'に' ? 'で' : 'に';
      await page.getByRole('button', { name: answer, exact: true }).click();
      await expect(page.getByRole('status')).toContainText(index < 7 ? '正確！' : '不對');
      await expect(page.getByRole('status')).toContainText(
        correct === 'に' ? '時間點' : '動作場所',
      );
      await expect(page.locator('.answer-choices button:disabled')).toHaveCount(2);
      const button = await page.getByRole('button', { name: '繼續', exact: true }).boundingBox();
      expect(button!.y + button!.height).toBeLessThanOrEqual(height!);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (index === 0 || index === 7)
        await page.screenshot({ path: `test-results/practice-${index}-${width}x${height}.png` });
      await page.getByRole('button', { name: '繼續', exact: true }).click();
    }
    await expect(page.getByRole('heading', { name: '完成！' })).toBeVisible();
    await expect(page.locator('.completion-score')).toHaveText('7 / 10');
    await page.screenshot({ path: `test-results/completion-${width}x${height}.png` });
    await page.getByRole('button', { name: '再來一組', exact: true }).click();
    await expect(page.locator('.question-count')).toHaveText('1 / 10');
    await expect(page.getByRole('status')).toHaveCount(0);
    await page.getByRole('button', { name: '離開練習' }).click();
    await expect(page.getByRole('button', { name: '開始', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '開始', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: '開始', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('unavailable lessons do not silently use lesson 18', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '練習設定', exact: true }).click();
  await page.getByRole('button', { name: '第 18 課', exact: true }).click();
  await page.getByRole('button', { name: '第 17 課', exact: true }).click();
  await page.getByRole('button', { name: '完成', exact: true }).click();
  await expect(page.getByRole('button', { name: '開始', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('目前有第 18 課');
});
