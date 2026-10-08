"use client";

import { useState, useSyncExternalStore } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { TestWordReading } from "@/features/readingTest/api/TestWordReading";
import { getRandomWord } from "@/entities/word/api/getRandomWord";
import { KanjiInfoCard, KanjiTree, kanjiData } from "@/entities/kanji";
import { POS_LABELS } from "@/entities/word/model/word";
import type { Word } from "@/entities/word/model/word";
import {
  CardStore,
  dueCards,
  keyOf,
  newCard,
  ratingFor,
  reviewCard,
  storage,
} from "@/shared/lib/srs";
import { wordsData } from "@/entities/word/model/data";

const emptySubscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function WordReadingTest({
  initialWord,
}: {
  initialWord: Word | undefined;
}) {
  const [word, setWord] = useState<Word | undefined>(initialWord);
  const [showResult, setShowResult] = useState(false);

  const [cards, setCards] = useState<CardStore>(() => storage.load());

  const [reviewQueue, setReviewQueue] = useState<Word[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);

  const hydrated = useHydrated();

  const due = hydrated
    ? dueCards(cards).filter((card) => card.skill === "reading")
    : [];

  if (!word) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography color="text.secondary">
          No words available.
        </Typography>
      </Paper>
    );
  }

  const currentKey = keyOf(word.id, "reading");
  const inPool = Boolean(cards[currentKey]);

  const addToPool = () => {
    if (cards[currentKey]) return;

    const card = newCard(word.id, "reading");

    const store = {
      ...cards,
      [currentKey]: card,
    };

    setCards(store);
    storage.save(store);
  };

  const startReview = () => {
    const words = due
      .map((card) =>
        wordsData.find((word) => word.id === card.itemId),
      )
      .filter((word): word is Word => Boolean(word));

    if (!words.length) return;

    setReviewQueue(words);
    setReviewIndex(0);
    setWord(words[0]);
    setReviewMode(true);
    setShowResult(false);
  };

  const nextWord = () => {
    if (reviewMode) {
      const nextIndex = reviewIndex + 1;

      if (nextIndex >= reviewQueue.length) {
        setReviewMode(false);
        setReviewQueue([]);
        setReviewIndex(0);
        setWord(getRandomWord(3));
        setShowResult(false);
        return;
      }

      setReviewIndex(nextIndex);
      setWord(reviewQueue[nextIndex]);
      setShowResult(false);
      return;
    }

    setWord(getRandomWord(3));
    setShowResult(false);
  };

  const handleResult = (won: boolean) => {
    setShowResult(true);

    if (!reviewMode) return;

    const key = keyOf(word.id, "reading");

    const card =
      cards[key] ?? newCard(word.id, "reading");

    const rating = ratingFor(won);

    const updated = reviewCard(
      card,
      rating,
    );

    const store = {
      ...cards,
      [key]: updated,
    };

    setCards(store);
    storage.save(store);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, md: 5 },
        maxWidth: 1000,
        mx: "auto",
        borderRadius: 3,
      }}
    >
      <Stack spacing={4}>
        {/* Header */}
        <Box textAlign="center">
          <Typography
            variant="overline"
            color="text.secondary"
            letterSpacing={2}
          >
            {reviewMode
              ? `SRS Review · ${reviewIndex + 1} / ${reviewQueue.length}`
              : "JLPT N3 · Reading Test"}
          </Typography>

          <Typography
            variant="h2"
            component="div"
            sx={{
              mt: 1,
              fontWeight: 600,
            }}
          >
            {word.text}
          </Typography>
        </Box>

        {/* Controls */}
        <Box textAlign="center">
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Button
              variant="contained"
              size="large"
              onClick={nextWord}
            >
              {reviewMode
                ? reviewIndex + 1 >= reviewQueue.length
                  ? "Finish Review"
                  : "Next Word →"
                : "Next Word →"}
            </Button>

            {!reviewMode && (
              <>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={addToPool}
                  disabled={inPool}
                >
                  {inPool
                    ? "In pool ✓"
                    : "Add to pool"}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={startReview}
                  disabled={!due.length}
                >
                  Review due ({due.length})
                </Button>
              </>
            )}
          </Stack>
        </Box>

        {/* Reading test */}
        <TestWordReading
          key={word.id}
          word={word}
          onResult={handleResult}
        />

        {/* Result */}
        {showResult && (
          <>
            <Divider />

            <Stack spacing={4}>
              {/* Basic information */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Stack spacing={2}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                  >
                    Meaning
                  </Typography>

                  <Typography variant="h6">
                    {word.glosses.join(", ")}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {word.jlpt !== null && (
                      <Chip
                        label={`JLPT N${word.jlpt}`}
                        size="small"
                      />
                    )}

                    {word.kanji_jlpt_max !== undefined &&
                      word.jlpt === null && (
                        <Chip
                          label={`Kanji difficulty: N${word.kanji_jlpt_max} (est.)`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                  </Stack>
                </Stack>
              </Box>

              {/* Kanji information */}
              {word.kanji.length > 0 && (
                <Stack spacing={2}>
                  <Typography variant="h5">
                    Kanji
                  </Typography>

                  <Grid container spacing={2}>
                    {word.kanji.map((character) => {
                      const kanji = kanjiData[character];

                      return (
                        <Grid
                          key={character}
                          size={{ xs: 12, md: 6 }}
                        >
                          <Stack spacing={2}>
                            <KanjiInfoCard
                              character={character}
                              kanji={kanji}
                            />

                            <KanjiTree
                              character={character}
                              kanji={kanji}
                            />
                          </Stack>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Stack>
              )}

              {/* Detailed senses */}
              {word.senses &&
                word.senses.length > 0 && (
                  <Stack spacing={2}>
                    <Typography variant="h5">
                      Meanings & Usage
                    </Typography>

                    {word.senses.map((sense, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          border: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              Sense {index + 1}
                            </Typography>

                            {sense.pos.map((code) => (
                              <Chip
                                key={code}
                                label={
                                  POS_LABELS[code] ?? code
                                }
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Stack>

                          <Stack spacing={0.5}>
                            {sense.glosses.map(
                              (gloss, glossIndex) => (
                                <Typography
                                  key={glossIndex}
                                >
                                  • {gloss}
                                </Typography>
                              ),
                            )}
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}

              {/* Examples */}
              {word.examples &&
                word.examples.length > 0 && (
                  <Stack spacing={2}>
                    <Typography variant="h5">
                      Example Sentences
                    </Typography>

                    <Stack spacing={2}>
                      {word.examples.map(
                        (example, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              bgcolor: "action.hover",
                            }}
                          >
                            <Stack spacing={1}>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                }}
                              >
                                {example.ja}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {example.en}
                              </Typography>
                            </Stack>
                          </Box>
                        ),
                      )}
                    </Stack>
                  </Stack>
                )}

              {/* Word metadata */}
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Word Information
                </Typography>

                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    Reading: {word.reading}
                  </Typography>

                  <Typography variant="body2">
                    Frequency: {word.freq}
                  </Typography>

                  {word.jmdict_id && (
                    <Typography variant="body2">
                      JMdict ID: {word.jmdict_id}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}