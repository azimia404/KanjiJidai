'use client';

import { Button, Typography } from '@mui/material';
import { FindKanjiForm } from '@/features/find/ui/FindKanjiForm';

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <Typography variant="h3" gutterBottom>
        Kanji Explorer Test
      </Typography>

      <FindKanjiForm />
    </div>
  );
}