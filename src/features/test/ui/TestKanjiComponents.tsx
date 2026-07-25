"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button, Paper, Stack, Typography } from "@mui/material";
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
import {
  CardStore,
  appendLog,
  dueCards,
  keyOf,
  newCard,
  ratingFor,
  reviewCard,
  storage,
} from "@/shared/lib/srs";

// Hydration-safe "are we on the client?" flag: false during SSR and the
// hydration render (server snapshot), true right after. No effect needed.
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

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

const DEFAULT_QUEUE = ["薬", "国", "精"];

export function TestKanjiComponents() {
  // Lazy initializer: storage.load() runs once, during the first render, on
  // the client (this is a "use client" component rendered in the browser).
  // No effect needed, so no post-mount setState cascade.
  const [cards, setCards] = useState<CardStore>(() => storage.load());

  // The session: a list of kanji and where we are in it.
  const [queue, setQueue] = useState<string[]>(DEFAULT_QUEUE);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  // Per-kanji state, reset between cards.
  const [selected, setSelected] = useState<KanjiComponent[]>([]);
  const [currentComponent, setCurrentComponent] =
    useState<KanjiComponent | null>(null);
  const [positionRound, setPositionRound] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Session-start box.
  const [input, setInput] = useState("");

  // How this session was started — free practice or scheduled review.
  // Only used for the log, so stats can tell the two apart.
  const [sessionMode, setSessionMode] = useState<"test" | "srs">("test");

  // Server HTML renders with an empty store (storage.load() returns {} there),
  // so anything derived from `cards` may only be shown after hydration —
  // otherwise the due count in the first client paint mismatches the server.
  const hydrated = useHydrated();

  // Re-render every 30s so the due count ticks up while you sit idle.
  // setState inside an interval callback (an external system notifying us)
  // is fine — it's setState directly in an effect body that's not.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const due = hydrated
    ? dueCards(cards).filter((c) => c.skill === "composition")
    : [];

  const startReview = () => {
    if (!due.length) return;
    setQueue(due.map((c) => c.kanji));
    setSessionMode("srs");
    setIndex(0);
    setResults([]);
    setFinished(false);
    resetKanjiState();
  };

  const kanji = queue[index];
  const round = useMemo(() => makeRound(kanji), [kanji]);
  const kanjiDone = selected.length === round.answers.length;

  const resetKanjiState = () => {
    setSelected([]);
    setCurrentComponent(null);
    setPositionRound(false);
    setMistakes(0);
  };

  const startSession = (text: string) => {
    const chars: string[] = [];
    for (const ch of text) {
      if (kanjiData[ch]?.decomposition.length) chars.push(ch);
    }
    if (!chars.length) return;
    setQueue(chars);
    setSessionMode("test");
    setIndex(0);
    setResults([]);
    setFinished(false);
    resetKanjiState();
  };

  const handleNext = () => {
    const won = mistakes === 0;

    // SRS: reschedule this kanji's card (creating it on first encounter),
    // file the result into a fresh store, persist, and log the event.
    const rating = ratingFor(won);
    const key = keyOf(kanji, "composition");
    const updated = reviewCard(
      cards[key] ?? newCard(kanji, "composition"),
      rating,
    );
    const store = { ...cards, [key]: updated };
    setCards(store);
    storage.save(store); // save `store`, not `cards` — state is still the old value here
    appendLog({
      ts: new Date().toISOString(),
      kanji,
      skill: "composition",
      rating,
      mode: sessionMode,
    });

    setResults((prev) => [...prev, won]);

    if (index + 1 >= queue.length) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    resetKanjiState();
  };

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

  if (finished) {
    const correct = results.filter(Boolean).length;
    return (
      <Stack spacing={3} sx={{ maxWidth: 480, mx: "auto", mt: 4 }}>
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Session complete
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {correct} / {queue.length} clean
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {
              setIndex(0);
              setResults([]);
              setFinished(false);
              resetKanjiState();
            }}
          >
            Again
          </Button>
          <Button
            variant="outlined"
            sx={{ mt: 2, ml: 1 }}
            disabled={!due.length}
            onClick={startReview}
          >
            Review due ({due.length})
          </Button>
        </Paper>
      </Stack>
    );
  }
  return (
    <Stack spacing={3} sx={{ maxWidth: 480, mx: "auto", mt: 4 }}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Stack direction="row" spacing={1}>
          <Input
            value={input}
            onChange={setInput}
            placeholder="Кандзи для теста"
          />
          <Button variant="contained" onClick={() => startSession(input)}>
            Start
          </Button>
          <Button
            variant="outlined"
            disabled={!due.length}
            onClick={startReview}
          >
            Review due ({due.length})
          </Button>
        </Stack>
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Kanji {index + 1} / {queue.length}
      </Typography>

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
                  if (!round.answers.includes(s)) {
                    setMistakes((m) => m + 1);
                  } else if (s.position === null) {
                    // KanjiVG leaves some components untagged (e.g. the
                    // content inside a kamae enclosure like 国's 玉) — there
                    // is no position to quiz, so accept the tile directly.
                    setSelected((prev) => [...prev, s]);
                  } else {
                    setPositionRound(true);
                    setCurrentComponent(s);
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
                  } else {
                    setMistakes((m) => m + 1);
                  }
                }}
              >
                {pos}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Paper>
      )}

      {kanjiDone && (
        <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h2">{kanji}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {mistakes === 0 ? "Clean!" : `${mistakes} mistake(s)`}
          </Typography>
          <Button variant="contained" onClick={handleNext}>
            {index + 1 >= queue.length ? "Finish" : "Next"}
          </Button>
        </Paper>
      )}
    </Stack>
  );
}
