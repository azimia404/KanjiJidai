import { kanjiData } from "@/entities/kanji";
import type { KanjiEntry } from "@/entities/kanji";

const allEntries = Object.values(kanjiData);

export function pickRandomComponents(query: string): KanjiEntry[] | undefined {
  const correct = kanjiData[query];
  if (!correct) return undefined;

  const wrongChoices: KanjiEntry[] = [];
  while (wrongChoices.length < 3) {
    const candidate = allEntries[Math.floor(Math.random() * allEntries.length)];
    if (candidate !== correct && !wrongChoices.includes(candidate)) {
      wrongChoices.push(candidate);
    }
  }

  const choices = [correct, ...wrongChoices];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return choices;
}