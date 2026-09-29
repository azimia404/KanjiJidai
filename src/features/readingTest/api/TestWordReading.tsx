"use client";

import { Fragment, useEffect, useState } from "react";
import { Button, Grid } from "@mui/material";
import { Input } from "@/shared/ui/Input/Input";
import {
  findKanji,
  KanjiTree,
  KanjiInfoCard,
  KanjiEntry,
} from "@/entities/kanji";
import { Paper, Stack, Typography, Chip } from "@mui/material";
import { wordsData } from "@/entities/word/model/data";
import { WordData, WordEntry } from "@/entities/word/model/word";
import { findWord } from "@/entities/word/api/findWord";

export function TestWordReading({ word }: { word: WordEntry | undefined }) {
  const [readingInput, setReadingInput] = useState("");
  const [correct, setCorrect] = useState<boolean>(false);
  const [showResult, setShowResult] = useState(false);

  const handleCheck = (query: string) => {
    const queryTrimmed = query.trim();
    setShowResult(true);

    if (!queryTrimmed) {
      setCorrect(false);
      return;
    }
    setCorrect(queryTrimmed === word?.reading);
  };

  console.log("WORD", word);
  console.log("wordsData", wordsData);

  return (
    <>
      <Typography variant="h2" component="span">
        {word?.text}
      </Typography>
      <Input
        value={readingInput}
        onChange={setReadingInput}
        placeholder="Введите чтение на хирагане"
      />

      <Button onClick={() => handleCheck(readingInput)}>Проверить</Button>

      {showResult && (
        <Typography variant="h3" component="span">
          {correct ? "Правильно!" : "Неправильно!"}
          {showResult && !correct && (
            <Typography variant="h4" component="span">
              Правильный ответ: {word?.reading}
            </Typography>
          )}
        </Typography>
      )}
    </>
  );
}
