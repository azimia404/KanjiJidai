"use client";

import { useState } from "react";
import { Button, Grid } from "@mui/material";
import { Input } from "@/shared/ui/Input/Input";
import { findKanji, KanjiTree, KanjiInfoCard } from "@/entities/kanji";

export function FindKanjiForm() {
  const [query, setQuery] = useState("精");
  const [result, setResult] = useState<ReturnType<typeof findKanji> | null>(
    findKanji(query),
  );

  const handleSearch = (query: string) => {
    setResult(findKanji(query) ?? null);
  };

  return (
    <>
      <Input value={query} onChange={setQuery} placeholder="Введите кандзи" />

      <Button onClick={() => handleSearch(query)}>Найти</Button>
      <Grid container spacing={2}>
        <Grid size={6}>
          {result && <KanjiInfoCard character={query} kanji={result} />}
        </Grid>

        <Grid size={6}>
          {result && <KanjiTree character={query} kanji={result} />}
        </Grid>
      </Grid>
    </>
  );
}
