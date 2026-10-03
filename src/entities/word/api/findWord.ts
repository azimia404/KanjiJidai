import { wordsByText } from "../model/data";
import type { Word } from "../model/word";

export function findWord(query: string): Word | undefined {
  return wordsByText[query];
}