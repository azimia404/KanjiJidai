// word.ts — matches words.json exactly (verified against the live file, not guessed).
// Sibling to your existing KanjiEntry/KanjiComponent/KanjiData types.

/** N5 (easiest) .. N1 (hardest) — same domain as KanjiEntry['jlpt'], so both can
 *  be filtered with the same `level === 3` style code. */
export type JlptLevel = 5 | 4 | 3 | 2 | 1;

export interface Sense {
  /** Raw JMdict part-of-speech codes, e.g. ["v5r","vi"]. Look up a label via
   *  POS_LABELS; always provide a fallback since rare codes may not be
   *  listed (this table covers the 53 that actually occur in the dataset
   *  this was built from — verified, not guessed — but JMdict is not
   *  guaranteed to never introduce another). */
  pos: string[];
  /** Up to 3 glosses for THIS sense specifically (not the whole word). */
  glosses: string[];
}

export interface Example {
  ja: string;
  en: string;
}

export interface Word {
  /** `${text}:${reading}` — unique by construction, stable across rebuilds. */
  id: string;

  /** The source JMdict entry, when there is one. ABSENT (not null) for words
   *  that had to be inserted from the JLPT list because JMdict's common-flag
   *  filter missed them (ある, あなた...). Several Word rows can share the
   *  same jmdict_id — that's expected when one entry has multiple common
   *  spellings (一日/１日) — just never use it as a row key, use `id`. */
  jmdict_id?: string;

  /** Written form, e.g. "火山" or "の". This is the join key onto kanji: every
   *  character in `kanji` is guaranteed to occur in `text`. */
  text: string;

  /** Kana reading, e.g. "かざん". Always present, even for kana-only words
   *  (there `reading === text`). */
  reading: string;

  /** Up to 3 short English glosses for the PRIMARY sense, ranked; glosses[0]
   *  is the one to show in a quiz option or a one-line list. Always equal to
   *  senses[0].glosses when senses is present — kept as its own field so
   *  code that just wants "the meaning" doesn't need to touch senses. */
  glosses: string[];

  /** ABSENT (not []) on words inserted from the JLPT list that JMdict's
   *  common-filter missed (あなた, ある...) — those have no raw JMdict sense
   *  data to draw from, only openjlpt's single flat meaning in `glosses`.
   *  When present: every sense of this word, capped at 5 (covers 98% of
   *  JMdict entries exactly; the rest just lose their rarest senses). */
  senses?: Sense[];

  /** ABSENT (not []) unless this word is one of the ~8,300 openjlpt covers
   *  AND it has at least one example there (89% of those do). Ja/En pairs,
   *  already matched to the right word — nothing further to look up. */
  examples?: Example[];

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

export type WordData = Word[];

/** Every part-of-speech code that occurs in jmdict-eng-common (verified by
 *  scanning the actual file — all 53, nothing assumed). Unknown code? Fall
 *  back to showing the raw string rather than nothing: `POS_LABELS[code] ?? code`. */
export const POS_LABELS: Record<string, string> = {
  'n': 'noun', 'vt': 'transitive verb', 'vs': 'suru verb', 'vi': 'intransitive verb',
  'adj-no': 'no-adjective', 'adj-na': 'na-adjective', 'v1': 'ichidan verb', 'adv': 'adverb',
  'v5r': 'godan verb (-ru)', 'v5s': 'godan verb (-su)', 'adj-i': 'i-adjective', 'exp': 'expression',
  'n-suf': 'noun suffix', 'v5k': 'godan verb (-ku)', 'adv-to': 'adverb (+と)',
  'v5m': 'godan verb (-mu)', 'v5u': 'godan verb (-u)', 'prt': 'particle', 'suf': 'suffix',
  'int': 'interjection', 'adj-f': 'prenominal adjective', 'ctr': 'counter', 'conj': 'conjunction',
  'pn': 'pronoun', 'pref': 'prefix', 'v5g': 'godan verb (-gu)', 'aux-v': 'auxiliary verb',
  'v5t': 'godan verb (-tsu)', 'vs-s': 'suru verb (special)', 'v5b': 'godan verb (-bu)',
  'n-pref': 'noun prefix', 'num': 'numeral', 'adj-pn': 'pre-noun adjectival',
  'vs-i': 'suru verb (irregular)', 'adj-t': 'taru adjective', 'vz': 'ichidan verb (zuru)',
  'adj-ix': 'i-adjective (ii/yoi)', 'v5k-s': 'godan verb (iku/yuku)',
  'v5r-i': 'godan verb (-ru, irregular)', 'vk': 'kuru verb', 'aux': 'auxiliary',
  'v5aru': 'godan verb (-aru)', 'aux-adj': 'auxiliary adjective', 'cop': 'copula',
  'v5u-s': 'godan verb (-u, special)', 'v1-s': 'ichidan verb (kureru-type)',
  'v5n': 'godan verb (-nu)', 'unc': 'unclassified', 'v2a-s': 'nidan verb (archaic)',
  'adj-ku': 'ku-adjective (archaic)', 'vr': 'irregular nu/ru verb', 'v4b': 'yodan verb (archaic)',
  'vs-c': 'su verb (archaic)',
};

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
