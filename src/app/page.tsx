"use client";

import { Button, Typography } from "@mui/material";
import { FindKanjiForm } from "@/features/find/ui/FindKanjiForm";
import { TestKanjiComponents } from "@/features/test/ui/TestKanjiComponents";
import { TestWordReading } from "@/features/readingTest/api/TestWordReading";
import { wordsData } from "@/entities/word/model/data";
import { useState } from "react";

export default function Home() {
  const [word, setWord] = useState(
    Object.values(wordsData).find((entry) => entry.jlpt === 3),
  );

  const nextWord = () => {
    const filteredWords = Object.values(wordsData).filter(
      (entry) => entry.jlpt === 3,
    );
    const nextIndex = Math.floor(Math.random() * filteredWords.length);
    setWord(filteredWords[nextIndex]);
  };
  return (
    <div style={{ padding: 40 }}>
      <Typography variant="h3" gutterBottom>
        Kanji Explorer Test
      </Typography>

      <FindKanjiForm />
      <TestKanjiComponents />
      <Button onClick={() => nextWord()}>&gt;&gt;&gt;</Button>

      <TestWordReading key={word?.text} word={word} />
    </div>
  );
}
