"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { Input } from "@/shared/ui/Input/Input";
import { Typography } from "@mui/material";
import { WordEntry } from "@/entities/word/model/word";

export function TestWordReading({
  word,
  onResult,
}: {
  word: WordEntry | undefined;
  onResult: (correct: boolean) => void;
}) {
  const [readingInput, setReadingInput] = useState("");
  const [correct, setCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleCheck = (query: string) => {
    const queryTrimmed = query.trim();
    const result = !!queryTrimmed && queryTrimmed === word?.reading;

    setCorrect(result);
    setShowResult(true);
    onResult(result);
  };

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
        <>
          <Typography variant="h3" component="span">
            {correct ? "Правильно!" : "Неправильно!"}
          </Typography>
          <Typography variant="h3" component="span">
            {word?.reading}
          </Typography>
        </>
      )}
    </>
  );
}
