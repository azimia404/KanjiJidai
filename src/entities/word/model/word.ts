// word.ts — matches words.json exactly (verified against the live file, not guessed).
// Sibling to your existing KanjiEntry/KanjiComponent/KanjiData types.

/** N5 (easiest) .. N1 (hardest) — same domain as KanjiEntry['jlpt'], so both can
 *  be filtered with the same `level === 3` style code. */
export type JlptLevel = 5 | 4 | 3 | 2 | 1;

export interface WordEntry {
  /** JMdict sequence number. Stable, but NOT unique after add_word_jlpt.py —
   *  words it had to insert reuse the source id with a "jlpt-{level}-" prefix
   *  (e.g. "jlpt-5-一日"), so treat `id` as an opaque key, not a lookup handle
   *  back into raw JMdict. Use `text` (or `text`+`reading`) to look a word up. */
  id: string;

  /** Written form, e.g. "火山" or "の". This is the join key onto kanji: every
   *  character in `kanji` is guaranteed to occur in `text`. */
  text: string;

  /** Kana reading, e.g. "かざん". Always present, even for kana-only words
   *  (there `reading === text`). */
  reading: string;

  /** Up to 3 short English glosses, ranked; glosses[0] is the primary one
   *  (the one to show in a quiz option or a one-line list). */
  glosses: string[];

  /** Unique kanji characters in `text`, sorted. EMPTY for kana-only words
   *  (の, する, とても...) — always check `.length` before assuming a word
   *  has kanji to link to. Never includes digits; see add_word_jlpt.py's
   *  normalize_numerals for why that matters when matching text elsewhere. */
  kanji: string[];

  /** Corpus frequency (wordfreq zipf scale, roughly 0–8; higher = more common).
   *  0 means "not found in the frequency corpus", not "definitely rare" —
   *  don't treat it as a hard signal for very short/rare-surface-form words. */
  freq: number;

  /** Official JLPT level for THIS WORD, from a real vocabulary list — null
   *  when the word isn't on that list. This is the only field safe to gate
   *  a "JLPT N3 deck" on. Never fall back to kanji_jlpt_max for that; see it. */
  jlpt: JlptLevel | null;

  /** ABSENT (not null — check with `'kanji_jlpt_max' in word` or optional
   *  chaining) unless jlpt is null AND at least one of this word's kanji has
   *  a known JLPT level. A rough difficulty GUESS (hardest kanji it contains),
   *  not a real JLPT claim — never render it as if it were `jlpt`. Useful only
   *  for sorting/labeling a "beyond JLPT" bucket, e.g. "Advanced (est.)". */
  kanji_jlpt_max?: JlptLevel;
}

export type WordData = Record<string, WordEntry>;

// ---- usage sketches (not exported, just documenting intent) ----
//
// const words: WordData = wordsRaw as WordData;
//
// // Kanji-page word list — pure filter, no precompute needed (verified fast
// // enough at 23k entries: sub-millisecond even unindexed).
// const containing = (ch: string) =>
//   words.filter(w => w.kanji.includes(ch)).sort((a, b) => b.freq - a.freq);
//
// // A real JLPT deck — gate ONLY on the authoritative field.
// const n3Deck = words.filter(w => w.jlpt === 3);
//
// // "Beyond JLPT" bucket — label it as an estimate, don't imply a real level.
// const bonus = words
//   .filter(w => w.jlpt === null && w.kanji_jlpt_max !== undefined)
//   .sort((a, b) => a.kanji_jlpt_max! - b.kanji_jlpt_max!);