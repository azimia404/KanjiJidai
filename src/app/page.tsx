"use client";

import { Typography } from "@mui/material";

import { FindKanjiForm } from "@/features/find/ui/FindKanjiForm";
import { TestKanjiComponents } from "@/features/test/ui/TestKanjiComponents";
import { WordReadingTest } from "@/widgets/wordReadingTest/WordReadingTest";

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <Typography variant="h3" gutterBottom>
        Kanji Explorer Test
      </Typography>

      <FindKanjiForm />

      <WordReadingTest />
      
      <TestKanjiComponents />

    </div>
  );
}