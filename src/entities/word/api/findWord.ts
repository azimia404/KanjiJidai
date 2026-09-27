import { wordsData } from "../model/data";
import type { WordEntry } from "../model/word";

export function findWord(query: string): WordEntry | undefined {
  return wordsData[query];
}