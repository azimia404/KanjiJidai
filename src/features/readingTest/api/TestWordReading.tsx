"use client";

import { Fragment, useState } from "react";
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

export function TestWordReading() {
  const [readingInput, setReadingInput] = useState("");
  const [word, setWord] = useState(
    Object.values(wordsData).filter((entry) => entry.jlpt === 3)[0].text,
  );
  const [correct, setCorrect] = useState<boolean>(false);
  const [showResult, setShowResult] = useState(false);
  const wordEntry: WordEntry | undefined = findWord(word);

  const handleCheck = (query: string) => {
    const queryTrimmed = query.trim();
    setShowResult(true);

    if (!queryTrimmed) {
      setCorrect(false);
      return;
    }
    if (query === wordEntry?.reading) {
      setCorrect(true);
    }
  };

  const nextWord = () => {
    const filteredWords = Object.values(wordsData).filter((entry) => entry.jlpt === 3);
    const currentIndex = filteredWords.findIndex((entry) => entry.text === word);
    const nextIndex = Math.floor(Math.random() * filteredWords.length);
    setWord(filteredWords[nextIndex].text);
    setReadingInput("");
    setCorrect(false);
    setShowResult(false);
  };

  console.log("wordEntry", wordEntry);
  console.log("wordsData", wordsData);
  console.log("wordsData[word]", wordsData[word]);
  return (
    <>
      <Typography variant="h2" component="span">
        {word}
      </Typography>
      <Button onClick={() => nextWord()}>&gt;&gt;&gt;</Button>
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
              Правильный ответ: {wordEntry?.reading}
            </Typography>
          )}
        </Typography>
      )}
    </>
  );
}
