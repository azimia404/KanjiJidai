"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { TestWordReading } from "@/features/readingTest/api/TestWordReading";
import { getRandomWord } from "@/entities/word/api/getRandomWord";
import { KanjiInfoCard, KanjiTree, kanjiData } from "@/entities/kanji";
import type { WordEntry } from "@/entities/word/model/word";

export function WordReadingTest() {
  const [word, setWord] = useState<WordEntry | undefined>(getRandomWord(3));

  const [showResult, setShowResult] = useState(false);

  const nextWord = () => {
    setWord(getRandomWord(3));
    setShowResult(false);
  };

  if (!word) {
    return (
      <Paper sx={{ p: 4 }}>
        <Typography color="text.secondary">No words available.</Typography>
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
          key={word.text}
          word={word}
          onResult={() => setShowResult(true)}
        />

        {/* Result */}
        {showResult && (
          <>
            <Divider />

            <Stack spacing={3}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Meaning
                </Typography>

                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {word.glosses.join(", ")}
                </Typography>
              </Box>

              {/* Kanji information */}
              {word.kanji.length > 0 && (
                <Stack spacing={2}>
                  <Typography variant="h5">Kanji</Typography>

                  <Grid container spacing={2}>
                    {word.kanji.map((character) => {
                      const kanji = kanjiData[character];

                      return (
                        <Grid key={character} size={{ xs: 12, md: 6 }}>
                          <Stack spacing={2}>
                            <Typography
                              variant="h4"
                              sx={{ fontWeight: 500 }}
                            ></Typography>

                            <KanjiInfoCard
                              character={character}
                              kanji={kanji}
                            />

                            <KanjiTree character={character} kanji={kanji} />
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
