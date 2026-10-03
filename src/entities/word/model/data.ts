import wordsRaw from "../../word/model/words.json";
import type { JlptLevel, WordData, Word } from "./word";

export const wordsData: WordData = wordsRaw as WordData;

export const words: Word[] = Object.values(wordsData);

export const wordsByJlpt: Record<JlptLevel, Word[]> = {
  1: words.filter((word) => word.jlpt === 1),
  2: words.filter((word) => word.jlpt === 2),
  3: words.filter((word) => word.jlpt === 3),
  4: words.filter((word) => word.jlpt === 4),
  5: words.filter((word) => word.jlpt === 5),
};

export const wordsByText: Record<string, Word> = Object.fromEntries(
  wordsData.map((word) => [word.text, word])
);