import { expect, test, type Page } from '@playwright/test';
import { EXAMPLES } from '../../src/data/examples';

interface AudioEvent {
  kind: string;
  text?: string;
  lang?: string;
  frequency?: number;
}

async function installAudioDevice(page: Page, failSpeech = false) {
  await page.addInitScript(
    ({ failSpeech }) => {
      const events: AudioEvent[] = [];
      Object.defineProperty(window, '__audioEvents', { value: events });
      class Utterance {
        lang = '';
        onerror: ((event: { error: string }) => void) | null = null;
        constructor(public text: string) {}
      }
      Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance });
      Object.defineProperty(window, 'speechSynthesis', {
        value: {
          getVoices: () => [{ lang: 'ja-JP' }],
          cancel: () => events.push({ kind: 'cancel' }),
          speak: (speech: Utterance) => {
            events.push({ kind: 'speech', text: speech.text, lang: speech.lang });
            if (failSpeech) speech.onerror?.({ error: 'language-unavailable' });
          },
        },
      });
      class Context {
        state = 'running';
        currentTime = 0;
        destination = {};
        constructor() {
          events.push({ kind: 'context' });
        }
        async resume() {}
        async close() {
          events.push({ kind: 'close' });
        }
        createOscillator() {
          const frequency = { value: 0 };
          return {
            frequency,
            connect() {},
            disconnect() {},
            start() {
              events.push({ kind: 'tone', frequency: frequency.value });
            },
            stop() {},
          };
        }
        createGain() {
          return {
            gain: {
              setValueAtTime() {},
              linearRampToValueAtTime() {},
              exponentialRampToValueAtTime() {},
            },
            connect() {},
            disconnect() {},
          };
        }
      }
      Object.defineProperty(window, 'AudioContext', { value: Context });
    },
    { failSpeech },
  );
}
async function events(page: Page) {
  return page.evaluate(() => Reflect.get(window, '__audioEvents') as AudioEvent[]);
}

test('speech only after submission, correct sentence on mistakes, replay and cleanup', async ({
  page,
}) => {
  await installAudioDevice(page);
  await page.goto('/');
  await page.getByRole('button', { name: '開始', exact: true }).click();
  await expect(page.getByRole('button', { name: '播放正確日文句子' })).toHaveCount(0);
  const sentence = await page.locator('.question-sentence').innerText();
  const example = EXAMPLES.find((item) => item.sentenceWithBlank === sentence)!;
  await page
    .getByRole('button', { name: example.particle === 'に' ? 'で' : 'に', exact: true })
    .click();
  expect(
    (await events(page)).filter((event) => event.kind === 'tone').map((event) => event.frequency),
  ).toEqual([440, 330]);
  expect((await events(page)).filter((event) => event.kind === 'speech')).toHaveLength(0);
  const play = page.getByRole('button', { name: '播放正確日文句子' });
  await play.click();
  await play.click();
  expect((await events(page)).filter((event) => event.kind === 'speech')).toEqual([
    { kind: 'speech', text: example.correctSentence, lang: 'ja-JP' },
    { kind: 'speech', text: example.correctSentence, lang: 'ja-JP' },
  ]);
  const cancellations = (await events(page)).filter((event) => event.kind === 'cancel').length;
  await page.getByRole('button', { name: '繼續', exact: true }).click();
  await expect(play).toHaveCount(0);
  expect((await events(page)).filter((event) => event.kind === 'cancel')).toHaveLength(
    cancellations + 1,
  );
  await page.getByRole('button', { name: '離開練習' }).click();
  expect((await events(page)).filter((event) => event.kind === 'close')).toHaveLength(1);
});

test('correct and completion sounds happen once, replay does not auto play', async ({ page }) => {
  await installAudioDevice(page);
  await page.goto('/');
  await page.getByRole('button', { name: '開始', exact: true }).click();
  for (let index = 0; index < 10; index++) {
    const sentence = await page.locator('.question-sentence').innerText();
    const example = EXAMPLES.find((item) => item.sentenceWithBlank === sentence)!;
    await page.getByRole('button', { name: example.particle, exact: true }).click();
    await page.getByRole('button', { name: '繼續', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: '完成！' })).toBeVisible();
  expect(
    (await events(page)).filter((event) => event.kind === 'tone').map((event) => event.frequency),
  ).toEqual([...Array.from({ length: 10 }, () => [1175, 1568]).flat(), 1047, 1319, 1568, 2093]);
  expect((await events(page)).filter((event) => event.kind === 'speech')).toHaveLength(0);
  await page.getByRole('button', { name: '再來一組', exact: true }).click();
  expect((await events(page)).filter((event) => event.kind === 'tone')).toHaveLength(24);
});

for (const [soundEnabled, japaneseSpeechEnabled] of [
  [false, true],
  [true, false],
  [false, false],
] as const) {
  test(`sound ${soundEnabled}, speech ${japaneseSpeechEnabled} are independent and persist`, async ({
    page,
  }) => {
    await installAudioDevice(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'App 設定' }).click();
    if (!soundEnabled) await page.getByRole('switch', { name: '音效', exact: true }).click();
    if (!japaneseSpeechEnabled)
      await page.getByRole('switch', { name: '日文語音', exact: true }).click();
    await page.getByRole('button', { name: '完成', exact: true }).click();
    await page.reload();
    await page.getByRole('button', { name: '開始', exact: true }).click();
    for (let index = 0; index < 10; index++) {
      await page.getByRole('button', { name: 'に', exact: true }).click();
      const play = page.getByRole('button', { name: '播放正確日文句子' });
      if (japaneseSpeechEnabled) await play.click();
      else await expect(play).toHaveCount(0);
      await page.getByRole('button', { name: '繼續', exact: true }).click();
    }
    const logged = await events(page);
    expect(logged.filter((event) => event.kind === 'tone')).toHaveLength(soundEnabled ? 24 : 0);
    expect(logged.filter((event) => event.kind === 'context')).toHaveLength(soundEnabled ? 1 : 0);
    expect(logged.filter((event) => event.kind === 'speech')).toHaveLength(
      japaneseSpeechEnabled ? 10 : 0,
    );
  });
}

test('speech errors keep next available, and clear on the next question', async ({ page }) => {
  await installAudioDevice(page, true);
  await page.goto('/');
  await page.getByRole('button', { name: '開始', exact: true }).click();
  await page.getByRole('button', { name: 'に', exact: true }).click();
  await page.getByRole('button', { name: '播放正確日文句子' }).click();
  await expect(page.locator('.speech-hint')).toHaveText('暫時無法播放，請再試一次');
  await page.getByRole('button', { name: '繼續', exact: true }).click();
  await expect(page.locator('.question-count')).toHaveText('2 / 10');
  await expect(page.locator('.speech-hint')).toHaveCount(0);
});

test('unsupported speech degrades without blocking answers', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'speechSynthesis', { value: undefined }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: '開始', exact: true }).click();
  await page.getByRole('button', { name: 'に', exact: true }).click();
  await expect(page.locator('.speech-hint')).toHaveText('此瀏覽器不支援語音播放');
  await expect(page.getByRole('button', { name: '播放正確日文句子' })).toHaveCount(0);
  await page.getByRole('button', { name: '繼續', exact: true }).click();
  await expect(page.locator('.question-count')).toHaveText('2 / 10');
});
