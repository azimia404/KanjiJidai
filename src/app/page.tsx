"use client";

import { Button, Grid, Typography } from "@mui/material";
import { FindKanjiForm } from "@/features/find/ui/FindKanjiForm";
import { TestKanjiComponents } from "@/features/test/ui/TestKanjiComponents";
import { TestWordReading } from "@/features/readingTest/api/TestWordReading";
import { wordsData } from "@/entities/word/model/data";
import { Fragment, useState } from "react";
import KanjiInfoCard from "@/entities/kanji/ui/KanjiInfoCard/KanjiInfoCard";
import KanjiTree from "@/entities/kanji/ui/KanjiTree/KanjiTree";
import { kanjiData } from "@/entities/kanji";

export default function Home() {
  const [word, setWord] = useState(
    Object.values(wordsData).find((entry) => entry.jlpt === 3),
  );

  const [showResult, setShowResult] = useState(false);

  const nextWord = () => {
    const filteredWords = Object.values(wordsData).filter(
      (entry) => entry.jlpt === 3,
    );

    const nextIndex = Math.floor(Math.random() * filteredWords.length);

    setWord(filteredWords[nextIndex]);
    setShowResult(false);
  };
  return (
    <div style={{ padding: 40 }}>
      <Typography variant="h3" gutterBottom>
        Kanji Explorer Test
      </Typography>

      <FindKanjiForm />
      <TestKanjiComponents />
      <Button onClick={() => nextWord()}>&gt;&gt;&gt;</Button>

      <TestWordReading
        key={word?.text}
        word={word}
        onResult={() => setShowResult(true)}
      />
      {showResult &&
        (word?.kanji.length ? word?.kanji.length : 0) > 0 && (
          <Grid container spacing={2}>
            {word?.kanji.map((kanji, index) => (
              <Fragment key={index}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <KanjiInfoCard character={kanji} kanji={kanjiData[kanji]} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <KanjiTree character={kanji} kanji={kanjiData[kanji]} />
                </Grid>
              </Fragment>
            ))}
          </Grid>
        )}
    </div>
  );
}
