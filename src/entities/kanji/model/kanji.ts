export const KANJI_POSITIONS = [
  'top',
  'bottom',
  'left',
  'right',
  'middle',
  'kamae',
  'kamaec',
  'nyo',
  'nyoc',
  'tare',
  'tarec',
  '⿵A',
  '⿵B',
] as const;

export type KanjiPosition = (typeof KANJI_POSITIONS)[number];

export interface KanjiComponent {
  element: string;
  original: string | null;
  position: KanjiPosition | null;
  phonetic: boolean;
  radical: boolean;
  meanings: string[];
  children: KanjiComponent[];
}

export interface KanjiEntry {
  meanings: string[];
  readings_on: string[];
  readings_kun: string[];
  strokes: number;
  grade: number | null;
  jlpt: number | null;
  freq: number | null;
  decomposition: KanjiComponent[];
}

export type KanjiData = Record<string, KanjiEntry>;
