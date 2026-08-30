const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const mapBlock = `      {floatingEmojis.map(e => (
        <div key={e.id} className="absolute bottom-20 left-1/2 text-4xl animate-float-up pointer-events-none drop-shadow-xl z-50 flex items-center justify-center w-12 h-12" style={{ marginLeft: \`\${e.x}px\` }}>
          {e.emoji === 'PAELLA' ? <PaellaIcon className="w-12 h-12 text-primary drop-shadow-md" /> : e.emoji}
        </div>
      ))}`;

// Also I'll remove any existing mapBlock instances just to be clean
code = code.replace(/\{floatingEmojis\.map[^>]+>[\s\S]*?<\/div>\s*\)\)\}/g, '');

const anchor = `        entityType="STORY" \n        entityId={currentStory.id} \n      />`;
if (code.includes(anchor)) {
  code = code.replace(anchor, anchor + '\n' + mapBlock);
  fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
  console.log('Successfully inserted floatingEmojis');
} else {
  // Try another anchor
  const anchor2 = `<ShareDMModal \n        isOpen={shareModalOpen}`;
  if (code.includes(anchor2)) {
    code = code.replace(anchor2, mapBlock + '\n      ' + anchor2);
    fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
    console.log('Successfully inserted floatingEmojis (anchor 2)');
  } else {
    console.log('Could not find anchor');
  }
}
