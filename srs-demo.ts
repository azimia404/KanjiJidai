// Throwaway demo: exercise srs.ts with a fake clock. Run: npx tsx srs-demo.ts
import { newCard, reviewCard, ratingFor, dueCards, keyOf, type CardStore } from "./src/shared/lib/srs";

const fmt = (ms: number) => {
  const m = ms / 60000;
  if (m < 60) return `${m.toFixed(1)} min`;
  const h = m / 60;
  if (h < 48) return `${h.toFixed(1)} h`;
  return `${(h / 24).toFixed(1)} days`;
};

let now = new Date("2026-07-25T12:00:00Z");

// A card you keep answering correctly, always reviewing exactly when due:
let card = newCard("薬", "composition", now);
console.log("薬 — clean every time:");
for (let i = 1; i <= 6; i++) {
  card = reviewCard(card, ratingFor(true), now);
  const interval = +card.fsrs.due - +now;
  console.log(`  review #${i}: next due in ${fmt(interval)}`);
  now = card.fsrs.due; // time-travel to the due date and review again
}

// Then one failure:
card = reviewCard(card, ratingFor(false), now);
console.log(`  after a FAIL: next due in ${fmt(+card.fsrs.due - +now)}`);

// dueCards with a time-travelled clock:
const t0 = new Date("2026-07-25T12:00:00Z");
const store: CardStore = {};
let a = newCard("国", "composition", t0);
a = reviewCard(a, ratingFor(true), t0);   // clean → due in ~10 min
let b = newCard("精", "composition", t0);
b = reviewCard(b, ratingFor(false), t0);  // failed → due in ~1 min
store[keyOf("国", "composition")] = a;
store[keyOf("精", "composition")] = b;

console.log("\ndueCards time-travel:");
console.log("  now:        ", dueCards(store, t0).map((c) => c.kanji));
console.log("  +5 minutes: ", dueCards(store, new Date(+t0 + 5 * 60000)).map((c) => c.kanji));
console.log("  +1 hour:    ", dueCards(store, new Date(+t0 + 3600000)).map((c) => c.kanji));
