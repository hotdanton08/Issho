import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [375, 667],
  [390, 844],
  [393, 852],
  [430, 932],
  [1280, 800],
]) {
  test(`shell and panels fit ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto('/');
    await expect(page.getByRole('button', { name: '開始', exact: true })).toBeEnabled();
    const start = await page.getByRole('button', { name: '開始', exact: true }).boundingBox();
    expect(start!.y + start!.height).toBeLessThan(height!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/home-${width}x${height}.png` });
    await page.getByRole('button', { name: '練習設定', exact: true }).click();
    await expect(page.getByRole('button', { name: '第 25 課', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '第 3 課', exact: true }).click();
    await page.getByRole('button', { name: '第 5 課', exact: true }).click();
    await expect(page.getByRole('button', { name: '第 3 課', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.screenshot({ path: `test-results/settings-${width}x${height}.png` });
    await page.getByText('助詞', { exact: true }).click();
    await page.getByRole('button', { name: 'まで', exact: true }).click();
    await expect(page.getByRole('button', { name: 'まで', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByText('模式', { exact: true }).click();
    await page.getByRole('button', { name: '助詞用途', exact: true }).click();
    await expect(page.getByRole('button', { name: '助詞用途', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.screenshot({ path: `test-results/choices-${width}x${height}.png` });
    await page.getByRole('button', { name: '完成', exact: true }).click();
    await expect(
      page
        .getByRole('region', { name: '目前練習設定' })
        .getByText('第 3、5、18 課', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'App 設定', exact: true }).click();
    await expect(page.getByRole('switch', { name: '音效', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '完成', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test('settings persist after reload and reopening, with mode validation', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: '開始', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('練習即將開放');
  await page.getByRole('button', { name: '練習設定', exact: true }).click();
  await page.getByRole('button', { name: '第 3 課', exact: true }).click();
  await page.getByRole('button', { name: '第 5 課', exact: true }).click();
  await page.getByText('助詞', { exact: true }).click();
  await page.getByRole('button', { name: 'で', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '練習設定' }).getByRole('status')).toBeVisible();
  await page.getByRole('button', { name: '完成', exact: true }).click();
  await expect(page.getByRole('button', { name: '開始', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '練習設定', exact: true }).click();
  await page.getByText('模式', { exact: true }).click();
  await page.getByRole('button', { name: '混合', exact: true }).click();
  await page.getByRole('button', { name: '完成', exact: true }).click();
  await expect(page.getByRole('button', { name: '開始', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'App 設定', exact: true }).click();
  await page.getByRole('switch', { name: '音效', exact: true }).click();
  await page.getByRole('switch', { name: '日文語音', exact: true }).click();
  await page.getByRole('button', { name: '完成', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('region', { name: '目前練習設定' }).getByText('第 3、5、18 課', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('region', { name: '目前練習設定' })).toContainText('混合');
  const reopened = await context.newPage();
  await reopened.goto('/');
  await expect(reopened.getByText('第 3、5、18 課', { exact: true })).toBeVisible();
  await reopened.getByRole('button', { name: 'App 設定', exact: true }).click();
  await expect(reopened.getByRole('switch', { name: '音效', exact: true })).not.toBeChecked();
  await expect(reopened.getByRole('switch', { name: '日文語音', exact: true })).not.toBeChecked();
  expect(
    await reopened.evaluate(() => JSON.parse(localStorage.getItem('issho.settings.v1')!)),
  ).toEqual({
    selectedLessons: [3, 5, 18],
    selectedParticles: ['に'],
    practiceMode: 'mixed',
    soundEnabled: false,
    japaneseSpeechEnabled: false,
  });
});
