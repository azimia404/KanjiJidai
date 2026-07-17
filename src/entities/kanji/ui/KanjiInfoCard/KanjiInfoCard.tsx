import { Paper, Stack, Typography, Chip } from "@mui/material";
import { KanjiEntry } from "../../model/kanji";

interface KanjiInfoCardProps {
  character: string;
  kanji: KanjiEntry;
}

export default function KanjiInfoCard({ character, kanji }: KanjiInfoCardProps) {
  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2, maxWidth: 480 }}>
      <Stack direction="row" spacing={2} alignItems="baseline">
        <Typography variant="h2" component="span">
          {character}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {kanji.meanings.join(", ")}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
        {kanji.strokes && (
          <Chip size="small" label={`${kanji.strokes} strokes`} />
        )}
        {kanji.grade && <Chip size="small" label={`Grade ${kanji.grade}`} />}
        {kanji.jlpt && <Chip size="small" label={`JLPT N${kanji.jlpt}`} />}
        {kanji.freq && <Chip size="small" label={`Freq #${kanji.freq}`} />}
      </Stack>

      {kanji.readings_on.length > 0 && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          <strong>On:</strong> {kanji.readings_on.join("、")}
        </Typography>
      )}
      {kanji.readings_kun.length > 0 && (
        <Typography variant="body2">
          <strong>Kun:</strong> {kanji.readings_kun.join("、")}
        </Typography>
      )}
    </Paper>
  );
}
