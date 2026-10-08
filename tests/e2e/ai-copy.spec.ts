import { expect, test, type Page } from '@playwright/test';
import { EXAMPLES } from '../../src/data/examples';

async function finishPractice(page: Page) {
  await page.getByRole('button', { name: '開始', exact: true }).click();
  await expect(page.getByRole('button', { name: '複製給 AI' })).toHaveCount(0);
  const records: string[] = [];
  for (let index = 0; index < 10; index++) {
    const sentence = await page.locator('.question-sentence').innerText();
    const heading = await page.getByRole('heading').innerText();
    const example = EXAMPLES.find((item) =>
      [item.correctSentence, item.sentenceWithBlank, item.wrongVariant?.sentence].includes(
        sentence,
      ),
    )!;
    let correct: string;
    let choices: string[];
    const isError = heading === '這句話的助詞對嗎？';
    if (isError) {
      correct = sentence === example.correctSentence ? '沒問題' : '有問題';
      choices = ['沒問題', '有問題'];
    } else {
      correct = heading === '這個助詞表示什麼？' ? example.usage : example.particle;
      choices = (await page.locator('.answer-choices button').allTextContents()).map((choice) =>
        choice.trim(),
      );
    }
    const answer = index < 7 ? correct : choices.find((choice) => choice !== correct)!;
    await page
      .getByRole('button', {
        name: isError ? (answer === '沒問題' ? '正確句子' : '錯誤句子') : answer,
        exact: true,
      })
      .click();
    records.push(`我選：${isError ? (answer === '沒問題' ? '○' : '×') : answer}`);
    await page.getByRole('button', { name: '繼續', exact: true }).click();
  }
  await expect(page.locator('.completion-score')).toHaveText('7 / 10');
  return records;
}

async function mockClipboard(
  page: Page,
  behavior: 'success' | 'fail-once' | 'missing' = 'success',
) {
  await page.addInitScript((behavior) => {
    let attempts = 0;
    Object.defineProperty(navigator, 'clipboard', {
      value:
        behavior === 'missing'
          ? undefined
          : {
              async writeText(text: string) {
                attempts++;
                if (behavior === 'fail-once' && attempts === 1)
                  throw new DOMException('Denied', 'NotAllowedError');
                Reflect.set(window, '__copiedExport', text);
              },
            },
    });
  }, behavior);
}

for (const [width, height] of [
  [375, 667],
  [390, 844],
  [393, 852],
  [430, 932],
  [1280, 800],
] as const) {
  test(`complete, copy all mixed records and replay fits ${width}x${height}`, async ({
    page,
    context,
  }) => {
    const realClipboard = width === 390;
    if (realClipboard) await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    else await mockClipboard(page);
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.getByRole('button', { name: '練習設定', exact: true }).click();
    await page.getByText('模式', { exact: true }).click();
    await page.getByRole('button', { name: '混合', exact: true }).click();
    await page.getByRole('button', { name: '完成', exact: true }).click();
    const records = await finishPractice(page);
    const copy = page.getByRole('button', { name: '複製給 AI', exact: true });
    await expect(copy).toBeInViewport();
    await copy.click();
    await expect(page.getByRole('button', { name: '已複製', exact: true })).toBeVisible();
    const output = realClipboard
      ? await page.evaluate(() => navigator.clipboard.readText())
      : await page.evaluate(() => Reflect.get(window, '__copiedExport') as string);
    expect(output.match(/^\d+\. 題目：/gm)).toHaveLength(10);
    expect(output.match(/^選項：/gm)).toHaveLength(10);
    expect(output.match(/^我選：/gm)).toHaveLength(10);
    expect(output).not.toMatch(/正確答案|總分|統計|請分析|模式：/);
    await expect(page.locator('.copy-status')).toHaveCount(0);
    for (const record of records) expect(output).toContain(record);
    for (const name of ['已複製', '再來一組', '回首頁']) {
      const rect = await page.getByRole('button', { name, exact: true }).boundingBox();
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `test-results/phase5-copied-${width}x${height}.png` });
    await page.getByRole('button', { name: '再來一組', exact: true }).click();
    await expect(page.getByText('已複製，可直接貼給 AI 分析')).toHaveCount(0);
    await page.getByRole('button', { name: '離開練習' }).click();
    await finishPractice(page);
    await expect(page.getByRole('button', { name: '複製給 AI', exact: true })).toBeVisible();
  });
}

for (const behavior of ['fail-once', 'missing'] as const) {
  test(`clipboard ${behavior} allows manual copy and recovery`, async ({ page }) => {
    await mockClipboard(page, behavior);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await finishPractice(page);
    await page.getByRole('button', { name: '複製給 AI', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('無法自動複製');
    await expect(page.getByRole('button', { name: '已複製', exact: true })).toHaveCount(0);
    const manual = page.getByRole('textbox', { name: '手動複製練習紀錄' });
    await expect(manual).toHaveAttribute('readonly', '');
    expect(await manual.inputValue()).toContain('10. 題目：');
    await manual.click();
    expect(
      await manual.evaluate((element) => {
        const textarea = element as HTMLTextAreaElement;
        return textarea.selectionEnd - textarea.selectionStart === textarea.value.length;
      }),
    ).toBe(true);
    if (behavior === 'fail-once') {
      await page.getByRole('button', { name: '複製給 AI', exact: true }).click();
      await expect(page.getByRole('button', { name: '已複製', exact: true })).toBeVisible();
      await expect(manual).toHaveCount(0);
    }
    await page.getByRole('button', { name: '再來一組', exact: true }).click();
    await expect(manual).toHaveCount(0);
  });
}

test('a late clipboard result does not mark a new session as copied', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: () =>
          new Promise<void>((resolve) => Reflect.set(window, '__finishCopy', resolve)),
      },
    }),
  );
  await page.goto('/');
  await finishPractice(page);
  await page.getByRole('button', { name: '複製給 AI', exact: true }).click();
  await page.getByRole('button', { name: '再來一組', exact: true }).click();
  await page.evaluate(() => (Reflect.get(window, '__finishCopy') as () => void)());
  await page.getByRole('button', { name: '離開練習' }).click();
  await finishPractice(page);
  await expect(page.getByRole('button', { name: '複製給 AI', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '已複製', exact: true })).toHaveCount(0);
});
