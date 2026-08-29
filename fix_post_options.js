const fs = require('fs');

let code = fs.readFileSync('src/components/domain/PostOptionsMenu.tsx', 'utf8');

code = code.replace(
  /export function PostOptionsMenu\(\{ entityType, entityId, allowComments, onDeleted, isPinned \}: \{ entityType: string, entityId: string, allowComments: boolean, onDeleted\?: \(\) => void, isPinned\?: boolean \}\) \{/,
  `export function PostOptionsMenu({ entityType, entityId, allowComments, onDeleted, isPinned, hidePin }: { entityType: string, entityId: string, allowComments: boolean, onDeleted?: () => void, isPinned?: boolean, hidePin?: boolean }) {`
);

code = code.replace(
  /<button onClick=\{handleFijar\} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors text-foreground">[\s\S]*?<\/button>/,
  `{!hidePin && (
              <button onClick={handleFijar} className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm hover:bg-muted font-medium border-b border-border transition-colors text-foreground">
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />} {isPinned ? "Desfijar de la cuadrícula" : "Fijar en la cuadrícula"}
              </button>
            )}`
);

fs.writeFileSync('src/components/domain/PostOptionsMenu.tsx', code);
console.log('Fixed PostOptionsMenu.tsx');
