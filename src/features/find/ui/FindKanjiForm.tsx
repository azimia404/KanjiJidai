"use client";

import { useState } from "react";
import { Button, Grid } from "@mui/material";
import { Input } from "@/shared/ui/Input/Input";
import { findKanji, KanjiTree, KanjiInfoCard, KanjiEntry } from "@/entities/kanji";

export function FindKanjiForm() {
  const [query, setQuery] = useState("自転車");
  const [resultArray, setResultArray] = useState<KanjiEntry[]>([]);

  const handleSearch = (query: string) => {
    const queryTrimmed = query.trim();
    if (!queryTrimmed) {
      setResultArray([]);
      return;
    }

    const results: KanjiEntry[] = [];

    for (const char of queryTrimmed) {
      const kanji = findKanji(char);
      if (kanji) results.push(kanji);
    }
    setResultArray(results);
  };

  return (
    <>
      <Input value={query} onChange={setQuery} placeholder="Введите кандзи" />

      <Button onClick={() => handleSearch(query)}>Найти</Button>

      {resultArray.length > 0 && (
        <Grid container spacing={2}>
          {resultArray.map((kanji, index) => (
            <>
              {console.log("kanji", kanji)}
              {console.log("kanji", resultArray)}
              <Grid size={6} key={index}>
                <KanjiInfoCard character={kanji.character} kanji={kanji} />
              </Grid>

              <Grid size={6} key={index + "tree"}>
                <KanjiTree character={kanji.character} kanji={kanji} />
              </Grid>
            </>
          ))}
        </Grid>
      )}
    </>
  );
}
