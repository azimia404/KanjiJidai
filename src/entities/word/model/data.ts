import wordsRaw from "../../word/model/words.json";
import { WordData } from "./word";

// The JSON stores each kanji's character as the record KEY, not as a field
// inside the entry. Inject it here so KanjiEntry.character is real at runtime.
export const wordsData: WordData = wordsRaw as WordData;