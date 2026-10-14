import type { Particle } from '../types/settings';

export const TEXTBOOK = {
  edition: '大新《大家的日本語》初級 I・II 改訂版',
  sourceEdition: 'みんなの日本語 初級Ⅰ 第2版',
  syllabus: 'https://www.3anet.co.jp/np/secure/0-0001-03-240000/0-0001-03-240000-1.pdf',
} as const;

interface CurriculumTarget {
  lesson: number;
  particle: Particle;
  usage: string;
  construction: string;
  syllabusPage: number;
  learningItem: string;
}

// Identify the tested position, not the sentence's background grammar.
// Pages refer to the official PDF, not the Taiwanese textbook.
export const CURRICULUM_TARGETS = {
  'l01-wa-topic': {
    lesson: 1,
    particle: 'は',
    usage: '主題',
    construction: 'NはNです',
    syllabusPage: 1,
    learningItem: '練習A 1～3',
  },
  'l01-no-affiliation': {
    lesson: 1,
    particle: 'の',
    usage: '所屬',
    construction: '組織の身分',
    syllabusPage: 1,
    learningItem: '練習A 4',
  },
  'l01-mo-addition': {
    lesson: 1,
    particle: 'も',
    usage: '也',
    construction: 'NもNです',
    syllabusPage: 1,
    learningItem: '練習A 5',
  },
  'l02-no-owner': {
    lesson: 2,
    particle: 'の',
    usage: '所有者',
    construction: '人の物',
    syllabusPage: 1,
    learningItem: '練習A 4',
  },
  'l02-no-content': {
    lesson: 2,
    particle: 'の',
    usage: '內容',
    construction: '內容の物',
    syllabusPage: 1,
    learningItem: '練習A 3',
  },
  'l03-no-origin': {
    lesson: 3,
    particle: 'の',
    usage: '產地',
    construction: '國名の物',
    syllabusPage: 1,
    learningItem: '練習A 6',
  },
  'l04-ni-time': {
    lesson: 4,
    particle: 'に',
    usage: '時間點',
    construction: '時刻にVます',
    syllabusPage: 1,
    learningItem: '練習A 4',
  },
  'l04-kara-start': {
    lesson: 4,
    particle: 'から',
    usage: '起點',
    construction: '時刻から時刻まで',
    syllabusPage: 1,
    learningItem: '練習A 3・5',
  },
  'l04-made-end': {
    lesson: 4,
    particle: 'まで',
    usage: '終點',
    construction: '時刻から時刻まで',
    syllabusPage: 1,
    learningItem: '練習A 3・5',
  },
  'l05-he-destination': {
    lesson: 5,
    particle: 'へ',
    usage: '方向',
    construction: '場所へ行く・来る・帰る',
    syllabusPage: 1,
    learningItem: '練習A 1',
  },
  'l05-de-transport': {
    lesson: 5,
    particle: 'で',
    usage: '交通手段',
    construction: '乗り物で行く・来る・帰る',
    syllabusPage: 1,
    learningItem: '練習A 2',
  },
  'l05-to-companion': {
    lesson: 5,
    particle: 'と',
    usage: '同行者',
    construction: '人と行く・来る・帰る',
    syllabusPage: 1,
    learningItem: '練習A 3',
  },
  'l05-ni-date': {
    lesson: 5,
    particle: 'に',
    usage: '時間點',
    construction: '日期に行く・来る・帰る',
    syllabusPage: 1,
    learningItem: '練習A 4',
  },
  'l06-wo-object': {
    lesson: 6,
    particle: 'を',
    usage: '動作對象',
    construction: 'Nを他動詞ます',
    syllabusPage: 1,
    learningItem: '練習A 1',
  },
  'l06-de-place': {
    lesson: 6,
    particle: 'で',
    usage: '動作場所',
    construction: '場所でVます',
    syllabusPage: 1,
    learningItem: '練習A 3',
  },
  'l18-ni-before': {
    lesson: 18,
    particle: 'に',
    usage: '時間點',
    construction: '動詞辭書形＋前に',
    syllabusPage: 2,
    learningItem: '練習A 5',
  },
  'l18-ga-ability': {
    lesson: 18,
    particle: 'が',
    usage: '能力對象',
    construction: 'N／動詞辭書形＋ことができます',
    syllabusPage: 2,
    learningItem: '練習A 1～3',
  },
} as const satisfies Record<string, CurriculumTarget>;

export type CurriculumTargetId = keyof typeof CURRICULUM_TARGETS;
