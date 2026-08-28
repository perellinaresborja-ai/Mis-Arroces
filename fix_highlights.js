const fs = require('fs');
let c = fs.readFileSync('src/components/domain/ProfileHighlightsClient.tsx', 'utf8');

if (!c.includes('import { EditHighlightModal }')) {
  c = c.replace(/import \{ CreateHighlightModal \} from "\.\/CreateHighlightModal"/, 'import { CreateHighlightModal } from "./CreateHighlightModal"\nimport { EditHighlightModal } from "./EditHighlightModal"');
  
  c = c.replace(/const \[selectedHighlight, setSelectedHighlight\] = useState<any \| null>\(null\)/, `const [selectedHighlight, setSelectedHighlight] = useState<any | null>(null)
  const [editingHighlight, setEditingHighlight] = useState<any | null>(null)`);

  c = c.replace(/\{h\.cover_url \? <img src=\{h\.cover_url\} className="w-full h-full object-cover"\/> : <div className="w-full h-full bg-muted-foreground\/20" \/>\}/g, `{h.cover_url ? <img src={h.cover_url} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-muted-foreground/20" />}
                 {isMe && <button onClick={(e) => { e.stopPropagation(); setEditingHighlight(h); }} className="absolute -top-1 -right-1 bg-zinc-900 border border-white/20 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs z-10 hover:scale-110 transition-transform">✎</button>}`);
                 
  // the div around the img needs position relative for absolute positioning of pencil
  c = c.replace(/<div className="w-full h-full rounded-full bg-card overflow-hidden">/g, '<div className="w-full h-full rounded-full bg-card overflow-hidden relative">');

  c = c.replace(/\{showCreate && \(/, `{editingHighlight && (
        <EditHighlightModal highlight={editingHighlight} archivedStories={archivedStories} onClose={() => setEditingHighlight(null)} />
      )}

      {showCreate && (`);

  fs.writeFileSync('src/components/domain/ProfileHighlightsClient.tsx', c);
}
