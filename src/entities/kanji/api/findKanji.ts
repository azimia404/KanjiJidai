import { kanjiData } from "../model/data";
import type { KanjiEntry } from "../model/kanji";

export function findKanji(query: string): KanjiEntry | undefined {
  return kanjiData[query];
}
