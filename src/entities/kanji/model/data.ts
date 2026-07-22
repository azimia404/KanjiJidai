import kanjiDataRaw from "./kanji_data.json";
import type { KanjiData, KanjiEntry } from "./kanji";

// The JSON stores each kanji's character as the record KEY, not as a field
// inside the entry. Inject it here so KanjiEntry.character is real at runtime.
const raw = kanjiDataRaw as Record<string, Omit<KanjiEntry, "character">>;

export const kanjiData: KanjiData = Object.fromEntries(
  Object.entries(raw).map(([character, entry]) => [
    character,
    { character, ...entry },
  ]),
);
