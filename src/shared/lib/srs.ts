export type Skill = "meaning" | "reading" | "composition";

import {
  createEmptyCard,
  fsrs,
  Rating,
  type Card as FsrsCard,
  Grade,
} from "ts-fsrs";

interface SrsCard {
  kanji: string;
  skill: Skill;
  fsrs: FsrsCard;
}

const scheduler = fsrs();

export function newCard(
  kanji: string,
  skill: Skill,
  now: Date = new Date(),
): SrsCard {
  return { kanji, skill, fsrs: createEmptyCard(now) };
}

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

export type CardStore = Record<string, SrsCard>;

// Store key. Includes the skill so the same kanji can be tracked
// independently per skill ("composition:薬" vs "meaning:薬").
export function keyOf(kanji: string, skill: Skill): string {
  return `${skill}:${kanji}`;
}

export function dueCards(store: CardStore, now: Date = new Date()) {
  return Object.values(store)
    .filter((card) => card.fsrs.due <= now)
    .sort((a, b) => +a.fsrs.due.getTime() - +b.fsrs.due.getTime());
}

export interface ReviewLogEntry {
  ts: string;
  kanji: string;
  skill: Skill;
  rating: Rating;
  mode: "test" | "srs";
}

const CARDS_KEY = "kanji-srs:cards:v1";
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