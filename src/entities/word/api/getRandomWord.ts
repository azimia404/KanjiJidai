import { wordsByJlpt } from "../model/data";
import type { JlptLevel, Word } from "../model/word";

export function getRandomWord(level: JlptLevel): Word | undefined {
  const pool = wordsByJlpt[level];

  if (pool.length === 0) {
    return undefined;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}