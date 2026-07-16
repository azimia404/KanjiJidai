import { KanjiEntry, KanjiComponent } from "@/shared/types/kanji";

interface KanjiTreeProps {
  character: string;
  kanji: KanjiEntry;
}

export default function KanjiTree({ character, kanji }: KanjiTreeProps) {
  return (
    <ul>
      <li>
        {character} — {kanji.meanings.join(', ')}
        {kanji.decomposition.length > 0 && (
          <ul>
            {kanji.decomposition.map((c, i) => <KanjiNode key={i} node={c} />)}
          </ul>
        )}
      </li>
    </ul>
  );
}

function KanjiNode({ node }: { node: KanjiComponent }) {
  return (
    <li>
      <span className={node.phonetic ? 'phonetic' : node.radical ? 'radical' : ''}>{node.element}</span> — {node.meanings.length ? node.meanings.join(', ') : 'No meanings'}
      {node.position && <span> ({node.position})</span>}
      {node.children.length > 0 && (
        <ul>
          {node.children.map((c, i) => <KanjiNode key={i} node={c} />)}
        </ul>
      )}
    </li>
  );
}
