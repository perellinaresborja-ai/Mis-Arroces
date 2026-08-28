const fs = require('fs');

let code = fs.readFileSync('src/components/domain/messages/MessageBubble.tsx', 'utf8');

const oldCopy = `  const handleCopy = () => {
    navigator.clipboard.writeText(mContent);
    setShowMenu(false);
  };`;

const newCopy = `  const handleCopy = () => {
    const textToCopy = mContent || realtimeUrl || '';
    if (textToCopy) navigator.clipboard.writeText(textToCopy);
    setShowMenu(false);
  };`;

code = code.replace(oldCopy, newCopy);

const oldRender = `{mContent && (
              <button onClick={handleCopy} className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors">
                <Copy className="w-4 h-4" /> Copiar
              </button>
            )}`;

const newRender = `<button onClick={handleCopy} className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors">
              <Copy className="w-4 h-4" /> Copiar
            </button>`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/components/domain/messages/MessageBubble.tsx', code);
