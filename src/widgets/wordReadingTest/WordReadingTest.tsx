"use client";

import { Fragment, useState } from "react";
import { Button, Grid, Typography } from "@mui/material";

import { TestWordReading } from "@/features/readingTest/api/TestWordReading";
import { getRandomWord } from "@/entities/word/api/getRandomWord";
import { KanjiInfoCard, KanjiTree, kanjiData } from "@/entities/kanji";
import type { WordEntry } from "@/entities/word/model/word";

export function WordReadingTest() {
  const [word, setWord] = useState<WordEntry | undefined>(
    getRandomWord(3),
  );

  const [showResult, setShowResult] = useState(false);

  const nextWord = () => {
    setWord(getRandomWord(3));
    setShowResult(false);
  };

  const glossText = word?.glosses.join(", ") ?? "";

  return (
    <>
      <Button onClick={nextWord}>&gt;&gt;&gt;</Button>

      <TestWordReading
        key={word?.text}
        word={word}
        onResult={() => setShowResult(true)}
      />

      {showResult && word && (
        <>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Gloss:</strong> {glossText}
          </Typography>

          {word.kanji.length > 0 && (
            <Grid container spacing={2}>
              {word.kanji.map((character) => (
                <Fragment key={character}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <KanjiInfoCard
                      character={character}
                      kanji={kanjiData[character]}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <KanjiTree
                      character={character}
                      kanji={kanjiData[character]}
                    />
                  </Grid>
                </Fragment>
              ))}
            </Grid>
          )}
        </>
      )}
    </>
  );
}