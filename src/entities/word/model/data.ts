import wordsRaw from "../../word/model/words.json";
import type { JlptLevel, WordData, WordEntry } from "./word";

export const wordsData: WordData = wordsRaw as WordData;

export const words: WordEntry[] = Object.values(wordsData);

export const wordsByJlpt: Record<JlptLevel, WordEntry[]> = {
  1: words.filter((word) => word.jlpt === 1),
  2: words.filter((word) => word.jlpt === 2),
  3: words.filter((word) => word.jlpt === 3),
  4: words.filter((word) => word.jlpt === 4),
  5: words.filter((word) => word.jlpt === 5),
};