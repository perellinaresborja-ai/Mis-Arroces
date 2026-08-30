const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const mapBlock = `      {floatingEmojis.map(e => (
        <div key={e.id} className="absolute bottom-20 left-1/2 text-4xl animate-float-up pointer-events-none drop-shadow-xl z-50 flex items-center justify-center w-12 h-12" style={{ marginLeft: \`\${e.x}px\` }}>
          {e.emoji === 'PAELLA' ? <PaellaIcon className="w-12 h-12 text-primary drop-shadow-md" /> : e.emoji}
        </div>
      ))}`;

code = code.replace(/\{floatingEmojis\.map[^>]+>[\s\S]*?<\/div>\s*\)\)\}/g, '');

const idx = code.lastIndexOf('entityId={currentStory.id}');
if (idx !== -1) {
  const endIdx = code.indexOf('/>', idx);
  if (endIdx !== -1) {
    code = code.substring(0, endIdx + 2) + '\n' + mapBlock + '\n' + code.substring(endIdx + 2);
    fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
    console.log('Successfully inserted floatingEmojis (anchor 3)');
  }
} else {
  console.log('Could not find anchor 3');
}
