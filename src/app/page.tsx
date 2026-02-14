'use client';

import { Button, Typography } from '@mui/material';
import { AccessAlarm } from '@mui/icons-material';

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <Typography variant="h3" gutterBottom>
        Kanji Explorer Test
      </Typography>

      <Button variant="contained" startIcon={<AccessAlarm />}>
        Test Button
      </Button>
    </div>
  );
}
