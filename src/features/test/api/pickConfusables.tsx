import kanjiDataRaw from "@/shared/assets/kanji_data.json";
import type { KanjiData, KanjiComponent } from "@/shared/types/kanji";

const kanjiData = kanjiDataRaw as KanjiData;

function collectElements(nodes: KanjiComponent[], into: Set<string>) {
  for (const node of nodes) {
    into.add(node.element);
    collectElements(node.children, into);
  }
}

const allComponentElements = (() => {
  const set = new Set<string>();
  for (const entry of Object.values(kanjiData)) {
    collectElements(entry.decomposition, set);
  }
  return Array.from(set);
})();

// Hand-authored lookalikes worth mixing in deliberately — these are the
// mix-ups a learner actually makes, not just visually random glyphs.
const CONFUSABLES: Record<string, string[]> = {
  '艹': ['⺮'],
  '⺮': ['艹'],
  '日': ['目', '白'],
  '目': ['日'],
  '白': ['日', '百'],
  '百': ['白'],
  '木': ['未', '末', '本'],
  '未': ['木', '末'],
  '末': ['木', '未'],
  '本': ['木'],
  '土': ['士'],
  '士': ['土'],
  '人': ['入'],
  '入': ['人'],
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickConfusables(
  answers: string[],
  forbidden: Set<string>,
  count: number,
): string[] {
  const exclude = new Set([...answers, ...forbidden]);
  const picked: string[] = [];

  const lookalikes = new Set<string>();
  for (const answer of answers) {
    for (const lookalike of CONFUSABLES[answer] ?? []) {
      if (!exclude.has(lookalike)) lookalikes.add(lookalike);
    }
  }
  for (const candidate of shuffle([...lookalikes])) {
    if (picked.length >= count) break;
    picked.push(candidate);
    exclude.add(candidate);
  }

  while (picked.length < count) {
    const candidate = allComponentElements[Math.floor(Math.random() * allComponentElements.length)];
    if (!exclude.has(candidate)) {
      picked.push(candidate);
      exclude.add(candidate);
    }
  }

  return picked;
}
