import { expect, test } from '@playwright/test';

test('answer produces a signal through the real Web Audio graph', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeContext = window.AudioContext;
    const samples: number[] = [];
    Object.defineProperty(window, '__soundSamples', { value: samples });
    class MeasuredContext extends NativeContext {
      override createGain() {
        const gain = super.createGain();
        const analyser = this.createAnalyser();
        analyser.fftSize = 2048;
        gain.connect(analyser);
        const data = new Float32Array(analyser.fftSize);
        const timer = setInterval(() => {
          analyser.getFloatTimeDomainData(data);
          samples.push(
            Math.sqrt(data.reduce((sum, value) => sum + value * value, 0) / data.length),
          );
        }, 10);
        setTimeout(() => clearInterval(timer), 1000);
        return gain;
      }
    }
    Object.defineProperty(window, 'AudioContext', { value: MeasuredContext });
  });
  await page.goto('/');
  await page.getByRole('button', { name: '開始', exact: true }).click();
  await page.getByRole('button', { name: 'に', exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => Math.max(0, ...(Reflect.get(window, '__soundSamples') as number[]))),
    )
    .toBeGreaterThan(0.04);
});
