import { KanjiEntry, KanjiComponent } from "../../model/kanji";
import { Paper, Typography, Chip, Box } from "@mui/material";

interface KanjiTreeProps {
  character: string;
  kanji: KanjiEntry;
}

export default function KanjiTree({ character, kanji }: KanjiTreeProps) {
  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2, maxWidth: 480 }}>
      <Box component="ol" sx={{ pl: 3, m: 0 }}>
        <Box component="li">
          <Typography component="span" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
            {character}
          </Typography>
          {' — '}
          <Typography component="span" variant="body2" color="text.secondary">
            {kanji.meanings.join(', ')}
          </Typography>

          {kanji.decomposition.length > 0 && (
            <Box component="ol" sx={{ pl: 3 }}>
              {kanji.decomposition.map((c, i) => (
                <KanjiNode key={i} node={c} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

function KanjiNode({ node }: { node: KanjiComponent }) {
  return (
    <Box component="li" sx={{ mt: 0.5 }}>
      <Typography
        component="span"
        className={node.phonetic ? 'phonetic' : node.radical ? 'radical' : ''}
        sx={{ fontWeight: 600 }}
      >
        {node.element}
      </Typography>
      {' — '}
      <Typography component="span" variant="body2" color="text.secondary">
        {node.meanings.length ? node.meanings.join(', ') : 'No meanings'}
      </Typography>
      {node.position && <Chip size="small" label={node.position} sx={{ ml: 1 }} />}

      {node.children.length > 0 && (
        <Box component="ol" sx={{ pl: 3 }}>
          {node.children.map((c, i) => (
            <KanjiNode key={i} node={c} />
          ))}
        </Box>
      )}
    </Box>
  );
}
