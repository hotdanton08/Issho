import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [375, 667],
  [390, 844],
  [393, 852],
  [430, 932],
] as const) {
  test(`desktop to Chromium mobile emulation ${width}x${height}`, async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.getByRole('button', { name: '開始', exact: true }).waitFor();
    // Keep Playwright's viewport aligned with CDP so screenshots preserve the emulated size.
    await page.setViewportSize({ width, height });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 3,
      mobile: true,
      screenWidth: width,
      screenHeight: height,
    });
    await expect.poll(async () => page.evaluate(() => innerWidth)).toBe(width);
    async function fits(name: string) {
      const button = page.getByRole('button', { name, exact: true });
      await expect
        .poll(async () => {
          const rect = await button.boundingBox();
          return (
            rect !== null &&
            rect.x >= 0 &&
            rect.y >= 0 &&
            rect.x + rect.width <= width &&
            rect.y + rect.height <= height
          );
        })
        .toBe(true);
    }
    await fits('開始');
    await fits('練習設定');
    await page.screenshot({ path: `test-results/emulation-home-${width}x${height}.png` });
    await page.getByRole('button', { name: '練習設定', exact: true }).click();
    await fits('完成');
    await page.screenshot({ path: `test-results/emulation-settings-${width}x${height}.png` });
    await page.getByText('範圍', { exact: true }).click();
    await fits('完成');
    await page.getByRole('button', { name: '第 25 課', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: '第 25 課', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '完成', exact: true }).click();
    await page.getByRole('button', { name: '開始', exact: true }).click();
    await page.getByRole('button', { name: 'に', exact: true }).click();
    await fits('繼續');
    await page.screenshot({ path: `test-results/emulation-feedback-${width}x${height}.png` });
    await page.getByRole('button', { name: '離開練習', exact: true }).click();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.getByRole('button', { name: '練習設定', exact: true }).click();
    await page.getByText('範圍', { exact: true }).click();
    await expect(page.getByRole('button', { name: '第 25 課', exact: true })).toBeVisible();
    await page.setViewportSize({ width, height });
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 3,
      mobile: true,
      screenWidth: width,
      screenHeight: height,
    });
    await fits('完成');
    await page.getByRole('button', { name: '第 25 課', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: '第 25 課', exact: true })).toBeInViewport();
    await page.screenshot({ path: `test-results/emulation-open-panel-${width}x${height}.png` });
    await page.getByRole('button', { name: '完成', exact: true }).click();
    await fits('開始');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    console.log(
      'Emulated viewport',
      await page.evaluate(() => ({
        innerWidth,
        innerHeight,
        visualWidth: visualViewport?.width,
        visualHeight: visualViewport?.height,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
      })),
    );
  });
}
