export type Skill = "meaning" | "reading" | "composition";

import {
  createEmptyCard,
  fsrs,
  Rating,
  type Card as FsrsCard,
  Grade,
} from "ts-fsrs";

export interface SrsCard {
  itemId: string;
  skill: Skill;
  fsrs: FsrsCard;
}

export function newCard(
  itemId: string,
  skill: Skill,
  now: Date = new Date(),
): SrsCard {
  return {
    itemId,
    skill,
    fsrs: createEmptyCard(now),
  };
}

const scheduler = fsrs();


export function reviewCard(
  card: SrsCard,
  rating: Grade,
  now: Date = new Date(),
): SrsCard {
  const { card: next } = scheduler.next(card.fsrs, now, rating);
  return { ...card, fsrs: next };
}
export function ratingFor(won: boolean): Rating.Again | Rating.Good {
  return won ? Rating.Good : Rating.Again;
}

// For a "needs work" pool: skip real FSRS grading and force the card due
// right now, whatever the user actually answered. Pure, like reviewCard;
// log it yourself with mode: "forced" if you want honest history. Only
// `due` changes (stability, reps, etc. are untouched), and answering
// correctly never graduates it: the way out is removing it from the pool.
export function gradeAsNeedsWork(card: SrsCard, now: Date = new Date()): SrsCard {
  return { ...card, fsrs: { ...card.fsrs, due: now } };
}

export type CardStore = Record<string, SrsCard>;

// Store key. Includes the skill so the same kanji can be tracked
// independently per skill ("composition:薬" vs "meaning:薬").
export function keyOf(item: string, skill: Skill): string {
  return `${skill}:${item}`;
}

export function dueCards(store: CardStore, now: Date = new Date()) {
  return Object.values(store)
    .filter((card) => card.fsrs.due <= now)
    .sort((a, b) => +a.fsrs.due.getTime() - +b.fsrs.due.getTime());
}

export interface ReviewLogEntry {
  ts: string;
  item: string;
  skill: Skill;
  rating: Rating;
  mode: "test" | "srs" | "forced"; // "forced" = gradeAsNeedsWork, not an honest answer
}

const CARDS_KEY = "kanji-srs:cards:v2";
const LOG_KEY = "kanji-srs:log:v1";

export const storage = {
  load(): CardStore {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(CARDS_KEY);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw) as CardStore;
      // JSON doesn't preserve Date objects, so we need to convert them back to Date instances.
      for (const card of Object.values(parsed)) {
        card.fsrs.due = new Date(card.fsrs.due);
        if (card.fsrs.last_review) {
          card.fsrs.last_review = new Date(card.fsrs.last_review);
        }
      }
      return parsed;
    } catch {
      return {};
    }
  },
  save(store: CardStore) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CARDS_KEY, JSON.stringify(store));
  },
};

export function appendLog(entry: ReviewLogEntry): void {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(LOG_KEY);
  const log: ReviewLogEntry[] = raw ? JSON.parse(raw) : [];
  log.push(entry);
  window.localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

/*
 * SRS INTEGRATION GUIDE
 *
 * The SRS system tracks learning progress for an ITEM + SKILL.
 *
 * Example:
 *   "薬" + "composition"  -> learn how to write 薬
 *   word.id + "reading"  -> learn how to read a word
 *
 * ---------------------------------------------------------------------------
 * BASIC FLOW
 * ---------------------------------------------------------------------------
 *
 * 1. ADD AN ITEM TO THE SRS POOL
 *
 *    const key = keyOf(itemId, skill);
 *
 *    if (!cards[key]) {
 *      const card = newCard(itemId, skill);
 *
 *      const store = {
 *        ...cards,
 *        [key]: card,
 *      };
 *
 *      setCards(store);
 *      storage.save(store);
 *    }
 *
 *
 * 2. GET CARDS THAT ARE DUE
 *
 *    const due = dueCards(cards).filter(
 *      (card) => card.skill === "reading",
 *    );
 *
 *    `cards` is the entire SRS pool.
 *    `due` contains only cards that should be reviewed now.
 *
 *
 * 3. CONVERT THE SRS CARDS INTO YOUR FEATURE'S DATA
 *
 *    SRS only stores `itemId`, `skill`, and FSRS data.
 *    Use `itemId` to find the actual item in your data.
 *
 *    Example for words:
 *
 *    const words = due
 *      .map((card) =>
 *        wordsData.find(
 *          (word) => word.id === card.itemId,
 *        ),
 *      )
 *      .filter(
 *        (word): word is Word => Boolean(word),
 *      );
 *
 *
 * 4. WHEN THE USER ANSWERS, REPORT THE RESULT
 *
 *    The test component should determine whether the answer was correct:
 *
 *      onResult(true);  // correct
 *      onResult(false); // incorrect
 *
 *
 * 5. UPDATE THE SRS CARD AFTER A REVIEW
 *
 *    const key = keyOf(itemId, skill);
 *    const card = cards[key];
 *
 *    if (!card) return;
 *
 *    const updated = reviewCard(
 *      card,
 *      ratingFor(won),
 *    );
 *
 *    const store = {
 *      ...cards,
 *      [key]: updated,
 *    };
 *
 *    setCards(store);
 *    storage.save(store);
 *
 *
 * ---------------------------------------------------------------------------
 * IMPORTANT CONCEPTS
 * ---------------------------------------------------------------------------
 *
 * CardStore = the entire SRS pool.
 *
 * dueCards(cards) = cards from the pool that are currently due.
 *
 * reviewQueue = temporary list of due items for the current review session.
 *
 * FSRS = decides when the card should be reviewed again.
 *
 * Random practice is separate from SRS. Calling getRandomWord() does not
 * affect SRS unless the feature explicitly adds/reviews the item.
 *
 *
 * ---------------------------------------------------------------------------
 * FULL EXAMPLE: WORD READING
 * ---------------------------------------------------------------------------
 *
 * const key = keyOf(word.id, "reading");
 *
 * // Add to SRS pool
 * if (!cards[key]) {
 *   const card = newCard(word.id, "reading");
 *
 *   const store = {
 *     ...cards,
 *     [key]: card,
 *   };
 *
 *   setCards(store);
 *   storage.save(store);
 * }
 *
 * // Get due cards
 * const dueReading = dueCards(cards).filter(
 *   (card) => card.skill === "reading",
 * );
 *
 * // After the user answers
 * const card = cards[key];
 *
 * if (card) {
 *   const updated = reviewCard(
 *     card,
 *     ratingFor(won),
 *   );
 *
 *   const store = {
 *     ...cards,
 *     [key]: updated,
 *   };
 *
 *   setCards(store);
 *   storage.save(store);
 * }
 *
 *
 * ---------------------------------------------------------------------------
 * RULES
 * ---------------------------------------------------------------------------
 *
 * - Use a stable itemId. For words, use word.id rather than word.text.
 * - Always specify the skill.
 * - Use keyOf() instead of manually creating card keys.
 * - Use reviewCard() to update FSRS; do not modify FSRS scheduling manually.
 * - Save the updated CardStore with storage.save().
 * - Do not put random-practice items into SRS automatically.
 * - The same item can have multiple independent cards:
 *     薬 + meaning
 *     薬 + reading
 *     薬 + composition
 */