import type { ParticleExample } from '../types/practice';
import type { Particle } from '../types/settings';

// Original Phase 2 samples. Lesson 18 practises dictionary-form 前に / ことができます.
const samples: [string, string, Particle, string][] = [
  ['ni-01', '寝る前（　）窓を閉めます。', 'に', '時間點'],
  ['ni-02', '出かける前（　）水を飲みます。', 'に', '時間點'],
  ['ni-03', '料理を作る前（　）手を洗います。', 'に', '時間點'],
  ['ni-04', '映画を見る前（　）ご飯を食べます。', 'に', '時間點'],
  ['ni-05', '勉強する前（　）机を片づけます。', 'に', '時間點'],
  ['de-01', 'この公園（　）テニスをすることができます。', 'で', '動作場所'],
  ['de-02', 'この店（　）写真を撮ることができます。', 'で', '動作場所'],
  ['de-03', 'この図書館（　）新聞を読むことができます。', 'で', '動作場所'],
  ['de-04', 'この学校（　）日本語を勉強することができます。', 'で', '動作場所'],
  ['de-05', 'このホテル（　）朝ご飯を食べることができます。', 'で', '動作場所'],
];

export const EXAMPLES: ParticleExample[] = samples.map(([id, sentence, particle, usage]) => {
  const correctSentence = sentence.replace('（　）', particle);
  return {
    id: `l18-${id}`,
    lesson: 18,
    correctSentence,
    sentenceWithBlank: sentence,
    particle,
    usage,
    distractorParticles: [particle === 'に' ? 'で' : 'に'],
    usageChoices: ['時間點', '動作場所', '對象', '手段'],
    shortExplanation: usage,
    audioText: correctSentence,
    wrongVariant: {
      sentence: sentence.replace('（　）', particle === 'に' ? 'で' : 'に'),
      wrongParticle: particle === 'に' ? 'で' : 'に',
    },
  };
});
