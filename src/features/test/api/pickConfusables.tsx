import kanjiDataRaw from "@/shared/assets/kanji_data.json";
import type { KanjiData, KanjiComponent } from "@/shared/types/kanji";

const kanjiData = kanjiDataRaw as KanjiData;

function collectElements(nodes: KanjiComponent[], into: Map<string, string[]>) {
  for (const node of nodes) {
    if (!into.has(node.element)) into.set(node.element, node.meanings);
    collectElements(node.children, into);
  }
}

const allComponents = (() => {
  const map = new Map<string, string[]>();
  for (const entry of Object.values(kanjiData)) {
    collectElements(entry.decomposition, map);
  }
  return map;
})();

const allComponentElements = Array.from(allComponents.keys());

// distractors aren't really part of the target kanji, so position/phonetic/
// radical don't apply — just carry the glyph and its own meanings, if any.
function toComponent(element: string): KanjiComponent {
  return {
    element,
    original: null,
    position: null,
    phonetic: false,
    radical: false,
    meanings: allComponents.get(element) ?? [],
    children: [],
  };
}

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
  answers: KanjiComponent[],
  forbidden: Set<string>,
  count: number,
): KanjiComponent[] {
  const answerElements = answers.map((a) => a.element);
  const exclude = new Set([...answerElements, ...forbidden]);
  const picked: string[] = [];

  const lookalikes = new Set<string>();
  for (const element of answerElements) {
    for (const lookalike of CONFUSABLES[element] ?? []) {
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

  return picked.map(toComponent);
}
