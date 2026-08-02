"use client";

import { Fragment, useState } from "react";
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
            <Fragment key={index}>
              <Grid size={{ xs: 12, md: 6 }}>
                <KanjiInfoCard character={kanji.character} kanji={kanji} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <KanjiTree character={kanji.character} kanji={kanji} />
              </Grid>
            </Fragment>
          ))}
        </Grid>
      )}
    </>
  );
}
