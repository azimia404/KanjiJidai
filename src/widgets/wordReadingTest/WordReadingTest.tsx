"use client";

import { useState } from "react";
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
import {
  KanjiInfoCard,
  KanjiTree,
  kanjiData,
} from "@/entities/kanji";
import { POS_LABELS } from "@/entities/word/model/word";
import type { Word } from "@/entities/word/model/word";

export function WordReadingTest() {
  const [word, setWord] = useState<Word | undefined>(getRandomWord(3));

  const [showResult, setShowResult] = useState(false);

  const nextWord = () => {
    setWord(getRandomWord(3));
    setShowResult(false);
  };

  if (!word) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography color="text.secondary">
          No words available.
        </Typography>
      </Paper>
    );
  }

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
            JLPT N3 · Reading Test
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

        {/* Next word */}
        <Box textAlign="center">
          <Button
            variant="contained"
            size="large"
            onClick={nextWord}
            sx={{
              px: 5,
              py: 1.25,
              borderRadius: 2,
            }}
          >
            Next Word →
          </Button>
        </Box>

        {/* Reading test */}
        <TestWordReading
          key={word.id}
          word={word}
          onResult={() => setShowResult(true)}
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

              {/* Detailed senses */}
              {word.senses && word.senses.length > 0 && (
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
                              label={POS_LABELS[code] ?? code}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>

                        <Stack spacing={0.5}>
                          {sense.glosses.map((gloss, glossIndex) => (
                            <Typography key={glossIndex}>
                              • {gloss}
                            </Typography>
                          ))}
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Examples */}
              {word.examples && word.examples.length > 0 && (
                <Stack spacing={2}>
                  <Typography variant="h5">
                    Example Sentences
                  </Typography>

                  <Stack spacing={2}>
                    {word.examples.map((example, index) => (
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
                            sx={{ fontWeight: 500 }}
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
                    ))}
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
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}