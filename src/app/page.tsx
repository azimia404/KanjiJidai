import { Typography } from "@mui/material";

import { FindKanjiForm } from "@/features/find/ui/FindKanjiForm";
import { TestKanjiComponents } from "@/features/test/ui/TestKanjiComponents";
import { WordReadingTest } from "@/widgets/wordReadingTest/WordReadingTest";
import { getRandomWord } from "@/entities/word/api/getRandomWord";

export default function Home() {
  const initialWord = getRandomWord(3);
  return (
    <div style={{ padding: 40 }}>
      <Typography variant="h3" gutterBottom>
        Kanji Explorer Test
      </Typography>

      <FindKanjiForm />

      <WordReadingTest initialWord={initialWord} />
      
      <TestKanjiComponents />

    </div>
  );
}
