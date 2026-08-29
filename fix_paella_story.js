const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// Import PaellaIcon if not present
if (!code.includes('PaellaIcon')) {
  code = `import { PaellaIcon } from "@/components/icons/PaellaIcon"\n` + code;
}

// Replace '❤️' with 'PAELLA' in the arrays
// {['❤️', '😂', '😮', '😢', '🔥', '👏'].map(emoji => (
// {['❤️', '😂', '😮', '😢', '🔥'].map(emoji => (

code = code.replace(
  /\['â ¤ï¸ ', 'ðŸ˜‚', 'ðŸ˜®', 'ðŸ˜¢', 'ðŸ”¥', 'ðŸ‘ '\]/g,
  "['PAELLA', '😂', '😮', '😢', '🔥', '👏']"
);
code = code.replace(
  /\['â ¤ï¸ ', 'ðŸ˜‚', 'ðŸ˜®', 'ðŸ˜¢', 'ðŸ”¥'\]/g,
  "['PAELLA', '😂', '😮', '😢', '🔥']"
);

// We need to match unicode. The console output shows encoding artifacts 'â ¤ï¸ ' for '❤️'
// It's safer to do string replacement for the exact unicode if I can, but JS literal might be best.
code = code.replace(
  /\['❤️', '😂', '😮', '😢', '🔥', '👏'\]/g,
  "['PAELLA', '😂', '😮', '😢', '🔥', '👏']"
);
code = code.replace(
  /\['❤️', '😂', '😮', '😢', '🔥'\]/g,
  "['PAELLA', '😂', '😮', '😢', '🔥']"
);

// We also need to fix the rendering!
// {emoji}
// -> {emoji === 'PAELLA' ? <PaellaIcon className="w-7 h-7 text-primary" /> : emoji}
// But there are multiple instances of `{emoji}`!

// In the map function:
// <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }} className="hover:scale-125 transition-transform drop-shadow-lg">
//   {emoji}
// </button>

code = code.replace(
  /<button key=\{emoji\} onClick=\{\(e\) => \{ e\.stopPropagation\(\); handleReaction\(emoji\); \}\} className="hover:scale-125 transition-transform drop-shadow-lg">\s*\{emoji\}\s*<\/button>/g,
  `<button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }} className="hover:scale-125 transition-transform drop-shadow-lg flex items-center justify-center w-8 h-8">
                      {emoji === 'PAELLA' ? <PaellaIcon className="w-8 h-8 text-primary drop-shadow-md" /> : emoji}
                    </button>`
);

code = code.replace(
  /className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform"\s*>\s*\{emoji\}\s*<\/button>/g,
  `className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                    >
                      {emoji === 'PAELLA' ? <PaellaIcon className="w-7 h-7 text-primary drop-shadow-md" /> : emoji}
                    </button>`
);

// And the floating emojis overlay:
// <div key={e.id} className="absolute bottom-20 left-1/2 text-4xl animate-float-up pointer-events-none drop-shadow-xl z-50" style={{ marginLeft: `${e.x}px` }}>
//   {e.emoji}
// </div>

code = code.replace(
  /<div key=\{e\.id\} className="absolute bottom-20 left-1\/2 text-4xl animate-float-up pointer-events-none drop-shadow-xl z-50" style=\{\{ marginLeft: `\$\{e\.x\}px` \}\}>\s*\{e\.emoji\}\s*<\/div>/g,
  `<div key={e.id} className="absolute bottom-20 left-1/2 text-4xl animate-float-up pointer-events-none drop-shadow-xl z-50 flex items-center justify-center w-12 h-12" style={{ marginLeft: \`\${e.x}px\` }}>
              {e.emoji === 'PAELLA' ? <PaellaIcon className="w-12 h-12 text-primary" /> : e.emoji}
            </div>`
);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed Paella reaction');
