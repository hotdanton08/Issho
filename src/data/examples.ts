import type { ParticleExample } from '../types/practice';
import type { Particle } from '../types/settings';
import { CURRICULUM_TARGETS } from './curriculum';
import type { CurriculumTargetId } from './curriculum';

interface ExampleGroup {
  targetId: CurriculumTargetId;
  wrongParticle: Particle;
  sentences: string[];
}

// Original sentences; the target determines the lesson, particle and usage.
const groups: ExampleGroup[] = [
  {
    targetId: 'l18-ni-before',
    wrongParticle: 'で',
    sentences: [
      '寝る前（　）窓を閉めます。',
      '出かける前（　）水を飲みます。',
      '料理を作る前（　）手を洗います。',
      '映画を見る前（　）ご飯を食べます。',
      '勉強する前（　）机を片づけます。',
      '泳ぐ前（　）シャワーを浴びます。',
      '旅行する前（　）お金を準備します。',
      '買い物する前（　）財布を見ます。',
      'お風呂に入る前（　）服を脱ぎます。',
      '本を読む前（　）眼鏡をかけます。',
    ],
  },
  {
    targetId: 'l01-wa-topic',
    wrongParticle: 'を',
    sentences: ['田中さん（　）医者です。', '山本さん（　）学生です。', '林さん（　）会社員です。'],
  },
  {
    targetId: 'l01-no-affiliation',
    wrongParticle: 'を',
    sentences: [
      '林さんは北川大学（　）学生です。',
      '田中さんは青山病院（　）医者です。',
      '山本さんは木村大学（　）先生です。',
    ],
  },
  {
    targetId: 'l01-mo-addition',
    wrongParticle: 'に',
    sentences: [
      '林さんは学生です。山本さん（　）学生です。',
      '田中さんは医者です。森さん（　）医者です。',
      '木村さんは会社員です。佐藤さん（　）会社員です。',
    ],
  },
  {
    targetId: 'l02-no-owner',
    wrongParticle: 'を',
    sentences: [
      'これは林さん（　）時計です。',
      'それは田中さん（　）傘です。',
      'あれは山本さん（　）かばんです。',
    ],
  },
  {
    targetId: 'l02-no-content',
    wrongParticle: 'を',
    sentences: [
      'これは日本語（　）本です。',
      'それは英語（　）本です。',
      'あれは車（　）雑誌です。',
    ],
  },
  {
    targetId: 'l03-no-origin',
    wrongParticle: 'を',
    sentences: [
      'これは台湾（　）時計です。',
      'それは日本（　）車です。',
      'あれは中国（　）かばんです。',
    ],
  },
  {
    targetId: 'l04-ni-time',
    wrongParticle: 'で',
    sentences: ['毎朝七時（　）起きます。', '毎晩十時（　）寝ます。', '六時半（　）起きました。'],
  },
  {
    targetId: 'l04-kara-start',
    wrongParticle: 'を',
    sentences: [
      '九時（　）五時まで働きます。',
      '八時（　）十二時まで勉強します。',
      '七時（　）九時まで勉強しました。',
    ],
  },
  {
    targetId: 'l04-made-end',
    wrongParticle: 'を',
    sentences: [
      '十時から六時（　）働きます。',
      '六時から八時（　）勉強します。',
      '九時から十一時（　）勉強しました。',
    ],
  },
  // Destination に is also valid; never use it as the wrong answer for へ.
  {
    targetId: 'l05-he-destination',
    wrongParticle: 'で',
    sentences: [
      '来週京都（　）行きます。',
      '明日病院（　）行きます。',
      '昨日大阪（　）行きました。',
    ],
  },
  {
    targetId: 'l05-de-transport',
    wrongParticle: 'を',
    sentences: [
      'バス（　）学校へ行きます。',
      '電車（　）京都へ行きました。',
      'タクシー（　）病院へ行きます。',
    ],
  },
  {
    targetId: 'l05-to-companion',
    wrongParticle: 'を',
    sentences: [
      '友達（　）京都へ行きます。',
      '母（　）大阪へ行きました。',
      '父（　）日本へ来ました。',
    ],
  },
  {
    targetId: 'l05-ni-date',
    wrongParticle: 'で',
    sentences: [
      '四月三日（　）日本へ行きます。',
      '六月十日（　）国へ帰ります。',
      '八月五日（　）京都へ行きます。',
    ],
  },
  {
    targetId: 'l06-wo-object',
    wrongParticle: 'に',
    sentences: ['朝ご飯（　）食べます。', '水（　）飲みます。', '新聞（　）読みます。'],
  },
  {
    targetId: 'l06-de-place',
    wrongParticle: 'に',
    sentences: [
      'この公園（　）テニスをします。',
      'この店（　）お茶を飲みます。',
      'この図書館（　）新聞を読みます。',
      'この学校（　）日本語を勉強します。',
      'このホテル（　）朝ご飯を食べます。',
    ],
  },
  {
    targetId: 'l18-ga-ability',
    wrongParticle: 'を',
    sentences: [
      '私は車を運転すること（　）できます。',
      '私は日本語を話すこと（　）できます。',
      '私は漢字を読むこと（　）できます。',
    ],
  },
];

export const EXAMPLES: ParticleExample[] = groups.flatMap((group) => {
  const target = CURRICULUM_TARGETS[group.targetId];
  return group.sentences.map((sentence, index) => {
    const correctSentence = sentence.replace('（　）', target.particle);
    return {
      id: `${group.targetId}-${String(index + 1).padStart(2, '0')}`,
      targetId: group.targetId,
      lesson: target.lesson,
      correctSentence,
      sentenceWithBlank: sentence,
      particle: target.particle,
      usage: target.usage,
      distractorParticles: [group.wrongParticle],
      usageChoices: [
        target.usage,
        ...['時間點', '動作場所', '對象', '手段'].filter((usage) => usage !== target.usage),
      ].slice(0, 4),
      shortExplanation: target.usage,
      audioText: correctSentence,
      wrongVariant: {
        sentence: sentence.replace('（　）', group.wrongParticle),
        wrongParticle: group.wrongParticle,
      },
    };
  });
});
