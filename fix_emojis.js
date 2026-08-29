const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// 1. Delete the duplicate Interaction Bar block
code = code.replace(
  /\{\/\* Interaction Bar \(Viewers only\) \*\/\}[\s\S]*?\}\)\}[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\}/,
  ''
);

// 2. Add floating emojis state
if (!code.includes('floatingEmojis')) {
  code = code.replace(
    /const \[showViewers, setShowViewers\] = useState\(false\)/,
    `const [showViewers, setShowViewers] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState<{id: number, emoji: string, x: number}[]>([])`
  );

  // Add the logic inside handleReaction
  code = code.replace(
    /const handleReaction = async \(reaction: string\) => \{/,
    `const handleReaction = async (reaction: string) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id, emoji: reaction, x: Math.random() * 40 - 20 }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
`
  );

  // Replace the emojis in Reply Bar
  code = code.replace(
    /\{(?:\[.*?\].map|\['\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDD25'\].map)\(emoji => \(\s*<button key=\{emoji\} onClick=\{\(e\) => \{ e\.stopPropagation\(\); handleReaction\(emoji\); \}\} className="hover:scale-125 transition-transform drop-shadow-lg">\s*\{emoji\}\s*<\/button>\s*\)\)\}/,
    `{['❤️', '😂', '😮', '😢', '🔥', '👏'].map(emoji => (
                    <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }} className="hover:scale-125 transition-transform drop-shadow-lg">
                      {emoji}
                    </button>
                  ))}`
  );

  // Render floating emojis in the wrapper
  code = code.replace(
    /<\/div>\s*\{showMenu && \(/,
    `
          {/* Floating Emojis */}
          <div className="absolute inset-0 pointer-events-none z-[80] overflow-hidden">
            {floatingEmojis.map(f => (
              <div 
                key={f.id}
                className="absolute bottom-20 text-4xl animate-float-up"
                style={{
                  left: \`calc(50% + \${f.x}px)\`
                }}
              >
                {f.emoji}
              </div>
            ))}
          </div>
          </div>
          {showMenu && (`
  );
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
console.log('Fixed duplicate footer and added floating animations');
