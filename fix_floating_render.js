const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

if (!code.includes('floatingEmojis.map')) {
  const rootEnd = code.lastIndexOf('</div>\n  )\n}');
  if (rootEnd !== -1) {
    code = code.substring(0, rootEnd) + 
    `\n      {floatingEmojis.map(e => (
        <div key={e.id} className="absolute bottom-20 left-1/2 text-4xl animate-float-up pointer-events-none drop-shadow-xl z-50 flex items-center justify-center w-12 h-12" style={{ marginLeft: \`\${e.x}px\` }}>
          {e.emoji === 'PAELLA' ? <PaellaIcon className="w-12 h-12 text-primary" /> : e.emoji}
        </div>
      ))}\n` + code.substring(rootEnd);
    fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
    console.log('Added floatingEmojis render for real');
  } else {
    // try different search
    const r2 = code.lastIndexOf('</div>');
    const r3 = code.lastIndexOf('</div>', r2 - 1);
    const r4 = code.lastIndexOf('</div>', r3 - 1);
    code = code.substring(0, r4) + 
    `\n      {floatingEmojis.map(e => (
        <div key={e.id} className="absolute bottom-20 left-1/2 text-4xl animate-float-up pointer-events-none drop-shadow-xl z-50 flex items-center justify-center w-12 h-12" style={{ marginLeft: \`\${e.x}px\` }}>
          {e.emoji === 'PAELLA' ? <PaellaIcon className="w-12 h-12 text-primary" /> : e.emoji}
        </div>
      ))}\n` + code.substring(r4);
    fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
    console.log('Added floatingEmojis render using fallback');
  }
}
