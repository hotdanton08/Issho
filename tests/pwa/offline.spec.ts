import { chromium, expect, test } from '@playwright/test';

for (const [width, height] of [
  [375, 667],
  [390, 844],
  [393, 852],
  [430, 932],
] as const) {
  test(`PWA reloads and completes practice offline at ${width}x${height}`, async ({
    page: fixturePage,
    context: fixtureContext,
  }, testInfo) => {
    const context =
      width === 390
        ? await chromium.launchPersistentContext(testInfo.outputPath('install-profile'), {
            channel: 'msedge',
            headless: true,
            baseURL: 'http://127.0.0.1:9002',
          })
        : fixtureContext;
    const page = width === 390 ? context.pages()[0]! : fixturePage;
    try {
      await page.setViewportSize({ width, height });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('/');
      await expect(page.getByRole('button', { name: '開始', exact: true })).toBeVisible();
      await page.evaluate(async () => {
        await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
          await new Promise<void>((resolve) =>
            navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
              once: true,
            }),
          );
        }
      });
      if (width === 390) {
        const cdp = await context.newCDPSession(page);
        const manifest = await cdp.send('Page.getAppManifest');
        expect(manifest.errors).toEqual([]);
        const data = JSON.parse(manifest.data!);
        expect(data.display).toBe('standalone');
        expect(data.lang).toBe('zh-Hant');
        expect(data.icons.some((icon: { purpose: string }) => icon.purpose === 'maskable')).toBe(
          true,
        );
        const installability = await cdp.send('Page.getInstallabilityErrors');
        expect(installability.installabilityErrors).toEqual([]);
        for (const icon of data.icons as { src: string }[]) {
          const response = await page.request.get(icon.src);
          expect(response.status()).toBe(200);
          expect(response.headers()['content-type']).toBe('image/png');
        }
      }
      // Never open practice online: its lazy chunk and local examples must already be cached.
      await context.setOffline(true);
      await page.reload();
      await expect(page.getByRole('button', { name: '開始', exact: true })).toBeEnabled();
      await page.getByRole('button', { name: 'App 設定' }).click();
      await page.getByRole('switch', { name: '音效', exact: true }).click();
      await page.getByRole('button', { name: '完成', exact: true }).click();
      await page.reload();
      await page.getByRole('button', { name: 'App 設定' }).click();
      await expect(page.getByRole('switch', { name: '音效', exact: true })).not.toBeChecked();
      await page.getByRole('button', { name: '完成', exact: true }).click();
      await page.getByRole('button', { name: '開始', exact: true }).click();
      for (let index = 0; index < 10; index++) {
        await expect(page.locator('.question-count')).toHaveText(`${index + 1} / 10`);
        await page.getByRole('button', { name: 'に', exact: true }).click();
        await page.getByRole('button', { name: '繼續', exact: true }).click();
      }
      await expect(page.getByRole('button', { name: '複製結果', exact: true })).toBeInViewport();
      await page.getByRole('button', { name: '複製結果', exact: true }).click();
      await expect(page.getByRole('button', { name: '已複製', exact: true })).toBeVisible();
      const home = await page.getByRole('button', { name: '回首頁', exact: true }).boundingBox();
      expect(home!.y + home!.height).toBeLessThanOrEqual(height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: `test-results/pwa-offline-${width}x${height}.png` });
      await page.getByRole('button', { name: '回首頁', exact: true }).click();
      await expect(page.getByRole('button', { name: '開始', exact: true })).toBeVisible();
      expect(errors).toEqual([]);
    } finally {
      if (width === 390) await context.close();
    }
  });
}
