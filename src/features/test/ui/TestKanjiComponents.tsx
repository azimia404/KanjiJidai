"use client";

import { useState } from "react";
import { Button, Paper, Stack, Chip, Typography } from "@mui/material";
import { Input } from "@/shared/ui/Input/Input";
import { findKanji } from "@/features/find/api/findKanji";
import KanjiTree from "@/shared/ui/KanjiTree/KanjiTree";
import kanjiDataRaw from "@/shared/assets/kanji_data.json";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { pickRandomComponents } from "@/features/test/api/pickRandomComponents";
import { KanjiComponent, KanjiData, KanjiEntry } from "@/shared/types/kanji";
import { pickConfusables } from "../api/pickConfusables";

const kanjiData = kanjiDataRaw as KanjiData;

export function makeRound(kanji: string) {
  const answers = kanjiData[kanji].decomposition.map(
    (c: KanjiComponent) => c.element,
  );
  const forbidden = allTreeNodes(kanjiData[kanji]); // every depth
  console.log("forbidden", forbidden);
  const distractors = pickConfusables(answers, forbidden, 4);
  console.log("distractors", distractors);
  return {
    prompt: kanjiData[kanji].meanings[0],
    tiles: shuffle([...answers, ...distractors]),
    answers,
  };
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  console.log("shuffling", arr);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  console.log("shuffled", copy);
  return copy;
}

function allTreeNodes(kanji: KanjiEntry): Set<string> {
  const nodes: Set<string> = new Set();
  function traverse(node: KanjiComponent) {
    nodes.add(node.element);
    node?.children.forEach(traverse);
  }
  kanji.decomposition.forEach(traverse);
  return nodes;
}

export function TestKanjiComponents() {
  const handleSearch = (q: string) => {
    setResult(findKanji(q) ?? null);
    setRound(makeRound(q));
    setSelected([]);
    setRevealed(false);
  };

  const [query, setQuery] = useState("国");
  const [result, setResult] = useState<ReturnType<typeof findKanji> | null>(
    findKanji(query),
  );

  const [round, setRound] = useState(() => makeRound(query));
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  return (
    <>
      {round.prompt}
      <ToggleButtonGroup aria-label="kanji components">
        {round.tiles.map((s) => {
          const found = selected.includes(s);
          return (
            <ToggleButton
              key={s}
              value={s}
              selected={found}
              disabled={found}
              aria-label={s}
              onClick={() => {
                if (round.answers.includes(s)) {
                  setSelected((prev) => [...prev, s]);
                  console.log("selected", selected);
                  console.log("round.answers", round.answers);
                }
              }}
            >
              {s}
            </ToggleButton>
          );
        })}
       </ToggleButtonGroup>

       {selected.length === round.answers.length && (query)}
    </>
  );
}

//   <Input
//     value={query}
//     onChange={setQuery}
//     placeholder="Введите кандзи"
//   />

//   <Button onClick={() => handleSearch(query)}>
//     Найти
//   </Button>

//   {result && (
//     <Paper elevation={2} sx={{ p: 3, mt: 2, maxWidth: 480 }}>
//       <Stack direction="row" spacing={2} alignItems="baseline">
//         <Typography variant="h2" component="span">{query}</Typography>
//         <Typography variant="body1" color="text.secondary">
//           {result.meanings.join(', ')}
//         </Typography>
//       </Stack>

//       <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
//         {result.strokes && <Chip size="small" label={`${result.strokes} strokes`} />}
//         {result.grade && <Chip size="small" label={`Grade ${result.grade}`} />}
//         {result.jlpt && <Chip size="small" label={`JLPT N${result.jlpt}`} />}
//         {result.freq && <Chip size="small" label={`Freq #${result.freq}`} />}
//       </Stack>

//       {result.readings_on.length > 0 && (
//         <Typography variant="body2" sx={{ mt: 2 }}>
//           <strong>On:</strong> {result.readings_on.join('、')}
//         </Typography>
//       )}
//       {result.readings_kun.length > 0 && (
//         <Typography variant="body2">
//           <strong>Kun:</strong> {result.readings_kun.join('、')}
//         </Typography>
//       )}
//     </Paper>
//   )}

//   {result && <KanjiTree character={query} kanji={result} />}
