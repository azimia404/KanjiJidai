import kanjiDataRaw from "@/shared/assets/kanji_data.json";
import type { KanjiData, KanjiEntry } from "@/shared/types/kanji";

const kanjiData = kanjiDataRaw as KanjiData;

export function findKanji(query: string): KanjiEntry | undefined {
  return kanjiData[query];
}