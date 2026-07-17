"use client";

import { useState } from "react";
import { Button, Paper, Stack, Chip, Typography } from "@mui/material";
import { Input } from "@/shared/ui/Input/Input";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import {
  kanjiData,
  KanjiComponent,
  KanjiEntry,
  KANJI_POSITIONS,
} from "@/entities/kanji";
import { pickConfusables } from "../api/pickConfusables";
import shuffle from "@/shared/lib/shuffle/shuffle";

export function makeRound(kanji: string) {
  const answers = kanjiData[kanji].decomposition;
  const forbidden = allTreeNodes(kanjiData[kanji]); // every depth
  const distractors = pickConfusables(answers, forbidden, 4);
  return {
    prompt: kanjiData[kanji].meanings[0],
    tiles: shuffle([...answers, ...distractors]),
    answers,
  };
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
  const [positionRound, setPositionRound] = useState(false);
  // const handleSearch = (q: string) => {
  //   setResult(findKanji(q) ?? null);
  //   setRound(makeRound(q));
  //   setSelected([]);
  //   setRevealed(false);
  // };

  const [query, setQuery] = useState("薬");
  // const [result, setResult] = useState<ReturnType<typeof findKanji> | null>(
  //   findKanji(query),
  // );

  const [round, setRound] = useState(() => makeRound(query));
  const [selected, setSelected] = useState<KanjiComponent[]>([]);
  const [currentComponent, setCurrentComponent] =
    useState<KanjiComponent | null>(null);
  // const [revealed, setRevealed] = useState(false);

  const tileGroupSx = {
    flexWrap: "wrap",
    gap: 1,
    "& .MuiToggleButtonGroup-grouped": {
      border: 1,
      borderColor: "divider",
      borderRadius: "8px !important",
      m: 0,
    },
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 480, mx: "auto", mt: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary">
          Assemble the kanji for
        </Typography>
        <Typography variant="h5" gutterBottom>
          {round.prompt}
        </Typography>

        <ToggleButtonGroup aria-label="kanji components" sx={tileGroupSx}>
          {round.tiles.map((s, i) => {
            const found = selected.includes(s);
            return (
              <ToggleButton
                key={i}
                value={s.element}
                selected={found}
                disabled={found}
                aria-label={s.element}
                sx={{ fontSize: "1.75rem", width: 56, height: 56 }}
                onClick={() => {
                  if (round.answers.includes(s)) {
                    setPositionRound(true);
                    setCurrentComponent(s);
                    // setSelected((prev) => [...prev, s]);
                  }
                }}
              >
                {s.element}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Paper>

      {positionRound && (
        <Paper elevation={4} sx={{ p: 3, bgcolor: "action.hover" }}>
          <Typography variant="subtitle1" gutterBottom>
            Where does <strong>{currentComponent?.element}</strong> go?
          </Typography>
          <ToggleButtonGroup
            aria-label="kanji component positions"
            sx={tileGroupSx}
          >
            {KANJI_POSITIONS.map((pos) => (
              <ToggleButton
                key={pos}
                value={pos}
                aria-label={pos}
                onClick={() => {
                  if (pos === currentComponent?.position) {
                    setSelected((prev) => [...prev, currentComponent]);
                    setCurrentComponent(null);
                    setPositionRound(false);
                  }
                }}
              >
                {pos}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Paper>
      )}

      {selected.length === round.answers.length && (
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h2">{query}</Typography>
          <Typography variant="body2" color="text.secondary">
            Complete!
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}