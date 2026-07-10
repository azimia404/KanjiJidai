'use client';

import { useState } from 'react';
import { Button, Paper, Stack, Chip, Typography } from '@mui/material';
import { Input } from '@/shared/ui/Input/Input';
import { findKanji } from '@/features/find/api/findKanji';
import KanjiTree from '@/shared/ui/KanjiTree/KanjiTree';

export function FindKanjiForm() {
  const [query, setQuery] = useState("精");
  const [result, setResult] = useState<ReturnType<typeof findKanji> | null>(findKanji(query));

  const handleSearch = (query: string) => {
    setResult(findKanji(query) ?? null);
  };

  return (
    <>
      <Input
        value={query}
        onChange={setQuery}
        placeholder="Введите кандзи"
      />

      <Button onClick={() => handleSearch(query)}>
        Найти
      </Button>

      {result && (
        <Paper elevation={2} sx={{ p: 3, mt: 2, maxWidth: 480 }}>
          <Stack direction="row" spacing={2} alignItems="baseline">
            <Typography variant="h2" component="span">{query}</Typography>
            <Typography variant="body1" color="text.secondary">
              {result.meanings.join(', ')}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
            {result.strokes && <Chip size="small" label={`${result.strokes} strokes`} />}
            {result.grade && <Chip size="small" label={`Grade ${result.grade}`} />}
            {result.jlpt && <Chip size="small" label={`JLPT N${result.jlpt}`} />}
            {result.freq && <Chip size="small" label={`Freq #${result.freq}`} />}
          </Stack>

          {result.readings_on.length > 0 && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>On:</strong> {result.readings_on.join('、')}
            </Typography>
          )}
          {result.readings_kun.length > 0 && (
            <Typography variant="body2">
              <strong>Kun:</strong> {result.readings_kun.join('、')}
            </Typography>
          )}
        </Paper>
      )}
    </>
  );
}